// Facebook Pixel helper
// Single Responsibility: Initialize Facebook Pixel only when ID is provided

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export function loadFBPixel(id: string): void {
  if (!id || id.trim() === '') {
    console.warn('Facebook Pixel ID não fornecido');
    return;
  }

  try {
    // Facebook Pixel base code
    !function(f: any, b: any, e: any, v: any, n: any, t: any, s: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize Pixel with provided ID
    window.fbq('init', id);
    window.fbq('track', 'PageView');

    console.log('Facebook Pixel carregado com sucesso:', id);
  } catch (error) {
    console.error('Erro ao carregar Facebook Pixel:', error);
  }
}
