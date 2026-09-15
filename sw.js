// Service Worker - permite que o app funcione offline.
// Sempre que voce alterar o index.html e publicar de novo no GitHub,
// mude o numero da versao abaixo (ex: 'v2', 'v3'...) para que os
// usuarios recebam a versao nova em vez da copia antiga guardada.
const CACHE_NAME = 'estoque-app-v2';

const ARQUIVOS_PARA_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-512-maskable.png',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Instala o service worker e guarda os arquivos no cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Remove caches antigos quando uma nova versao e ativada
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((nomes) => {
            return Promise.all(
                nomes
                    .filter((nome) => nome !== CACHE_NAME)
                    .map((nome) => caches.delete(nome))
            );
        }).then(() => self.clients.claim())
    );
});

// Estrategia: tenta a rede primeiro (pra pegar atualizacoes quando ha
// internet); se falhar (sem internet), usa o que esta guardado no cache.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((respostaRede) => {
                const copia = respostaRede.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, copia);
                });
                return respostaRede;
            })
            .catch(() => caches.match(event.request))
    );
});
