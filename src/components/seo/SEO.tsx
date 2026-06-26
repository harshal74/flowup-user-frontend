import { useEffect } from 'react';
import type { RestaurantSettings, MenuItem, Category } from '../../types';

interface SEOProps {
  settings?: RestaurantSettings | null;
  menuItem?: MenuItem;
  category?: Category;
  title?: string;
  description?: string;
  keywords?: string[];
}

function setMeta(selector: string, attr: string, value: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const parts = selector.match(/\[(\w+(?::\w+)?)=['"](.*)['"]\]/);
    if (parts) {
      el.setAttribute(parts[1], parts[2]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export function SEO({ settings, menuItem, category, title, description, keywords }: SEOProps) {
  useEffect(() => {
    // Page title
    let pageTitle = 'Restaurant';
    if (menuItem) {
      pageTitle = `${menuItem.name} | ${settings?.restaurantName || 'Restaurant'}`;
    } else if (category) {
      pageTitle = `${category.name} | ${settings?.restaurantName || 'Restaurant'}`;
    } else if (title) {
      pageTitle = `${title} | ${settings?.restaurantName || 'Restaurant'}`;
    } else if (settings?.restaurantName) {
      pageTitle = settings.restaurantName;
    }
    document.title = pageTitle;

    const baseName = settings?.restaurantName || 'Restaurant';
    const baseDescription = description || menuItem?.description || settings?.restaurantDescription || 'Order delicious food online';
    const baseImage = menuItem?.image || settings?.restaurantLogo || '';
    const baseUrl = window.location.origin;
    const pageDescription = description || baseDescription;
    const keywordString = keywords?.join(', ') || `${baseName}, restaurant, food delivery, online ordering${menuItem ? `, ${menuItem.name}` : ''}${category ? `, ${category.name}` : ''}`;

    // Primary meta
    setMeta('meta[name="description"]', 'content', pageDescription);
    setMeta('meta[name="keywords"]', 'content', keywordString);

    // Open Graph
    setMeta('meta[property="og:type"]', 'content', menuItem ? 'product' : 'website');
    setMeta('meta[property="og:url"]', 'content', baseUrl);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', pageDescription);
    setMeta('meta[property="og:image"]', 'content', baseImage);
    setMeta('meta[property="og:site_name"]', 'content', baseName);

    // Twitter
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', pageDescription);
    setMeta('meta[name="twitter:image"]', 'content', baseImage);

    // Structured Data JSON-LD
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': menuItem ? 'MenuItem' : 'Restaurant',
      ...(menuItem
        ? {
            name: menuItem.name,
            description: menuItem.description,
            image: menuItem.image,
            offers: {
              '@type': 'Offer',
              price: menuItem.discountedPrice || menuItem.price,
              priceCurrency: 'INR',
              availability: menuItem.isAvailable
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            },
            suitableForDiet: menuItem.isVeg
              ? 'https://schema.org/VegetarianDiet'
              : undefined,
          }
        : {
            name: baseName,
            description: baseDescription,
            image: settings?.restaurantLogo || '',
            url: baseUrl,
            telephone: settings?.contactNumber,
            address: {
              '@type': 'PostalAddress',
              streetAddress: settings?.address,
            },
            servingCuisine: 'Indian',
            priceRange: '$$',
            ...(settings?.rating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: settings.rating,
                reviewCount: settings.totalReviews || 0,
              },
            }),
            openingHoursSpecification: {
              '@type': 'OpeningHoursSpecification',
              opens: settings?.openingTime,
              closes: settings?.closingTime,
            },
          }),
    };

    let ldScript = document.querySelector('script[type="application/ld+json"]');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(structuredData);
  }, [settings, menuItem, category, title, description, keywords]);

  return null;
}
