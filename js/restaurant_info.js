let restaurant;
let map;

/**
 * Initialize Google map, called from HTML.
 *
 * @returns {void}
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, map);
    }
  });
};

/**
 * Get current restaurant from page URL.
 *
 * @param {function} callback Callback function.
 * @returns {void}
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 *
 * @param {Object} restaurant Restaurant.
 * @returns {void}
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageResponsiveUrlForRestaurant(restaurant, 400);
  image.alt = restaurant.name + ' restaurant';

  const sourceLarge = document.getElementById('img-large');
  sourceLarge.srcset = DBHelper.imageUrlForRestaurant(restaurant);
  const sourceMedium = document.getElementById('img-medium');
  sourceMedium.srcset = DBHelper.imageResponsiveUrlForRestaurant(restaurant, 670);
  const sourceSmall = document.getElementById('img-small');
  sourceSmall.srcset = DBHelper.imageResponsiveUrlForRestaurant(restaurant, 530);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 *
 * @param {Object} operatingHours Operating hours.
 * @returns {void}
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    if (operatingHours.hasOwnProperty(key)) {
      const row = document.createElement('tr');

      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);

      hours.appendChild(row);
    }
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 *
 * @param {Object} reviews Reviews.
 * @returns {void}
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.setAttribute('tabindex', '0');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 *
 * @param {Object} review Review.
 * @returns {string} `<li>` element with review comments.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('tabindex', '0');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 *
 * @param {Object} restaurant Restaurant.
 * @returns {void}
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const anchor = document.createElement('a');
  anchor.setAttribute('href', '#');
  anchor.setAttribute('aria-current', 'page');
  anchor.setAttribute('class', 'current-page');
  anchor.innerHTML = restaurant.name;
  const li = document.createElement('li');
  li.appendChild(anchor);
  const breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 *
 * @param {string} name   Name of the URL parameter.
 * @param {string} url    URL.
 * @returns {string|null} Value of the URL parameter.
 */
const getParameterByName = (name, url) => {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

// Registers the service worker, see https://developers.google.com/web/fundamentals/primers/service-workers/
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
