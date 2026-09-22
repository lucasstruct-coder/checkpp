// Service Worker do Checklist PP — guarda o app em cache pra funcionar
// offline. Como o app é um arquivo único (toda a lógica e as imagens já
// vêm embutidas nele), só precisamos cachear ele + o manifest + os
// ícones. Sempre que publicar uma versão nova, aumente o número da
// versão abaixo (CACHE_NOME) — isso força os usuários a baixarem a
// versão atualizada na próxima vez que abrirem o app.
const CACHE_NOME = "checklist-pp-v45";
const ARQUIVOS_PARA_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  // remove caches de versões antigas, pra não acumular espaço à toa
  evento.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(
        chaves
          .filter((chave) => chave !== CACHE_NOME)
          .map((chave) => caches.delete(chave))
      )
    )
  );
  self.clients.claim();
});

// Estratégia "cache primeiro, rede como reforço": tenta servir do cache
// (rápido, funciona offline); se não achar, busca na rede e guarda pra
// próxima vez.
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((respostaCache) => {
      if (respostaCache) return respostaCache;
      return fetch(evento.request).then((respostaRede) => {
        return caches.open(CACHE_NOME).then((cache) => {
          cache.put(evento.request, respostaRede.clone());
          return respostaRede;
        });
      }).catch(() => {
        // sem cache e sem rede -- não tem o que fazer, deixa o navegador
        // mostrar o erro padrão dele
      });
    })
  );
});
