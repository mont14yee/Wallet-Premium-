const CACHE_NAME = 'wallet-app-cache-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/contexts/LanguageContext.tsx',
  '/locales/index.ts',
  '/locales/en.ts',
  '/locales/am.ts',
  '/components/Header.tsx',
  '/components/FooterNav.tsx',
  '/components/ViewContainer.tsx',
  '/components/Sidebar.tsx',
  '/components/Chatbot.tsx',
  '/components/TransactionView.tsx',
  '/components/charts/CategoryChart.tsx',
  '/components/charts/FinancialHealthChart.tsx',
  '/components/charts/MonthlyFlowChart.tsx',
  '/components/charts/BloomingFlowerChart.tsx',
  '/views/DashboardView.tsx',
  '/views/IncomeView.tsx',
  '/views/ExpensesView.tsx',
  '/views/TargetsView.tsx',
  '/views/CalculatorView.tsx',
  '/views/LoansView.tsx',
  '/views/SubscriptionsView.tsx',
  '/views/ActivityLogView.tsx',
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
    // Use stale-while-revalidate for all GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });

                // Return cached response immediately if available, and fetch in background.
                // If not in cache, wait for the network response.
                return cachedResponse || fetchPromise;
            });
        })
    );
});