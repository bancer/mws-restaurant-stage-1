/**
 * Common database helper functions.
 */
class DBHelper {

  static openDatabase() {
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('mws-restaurants', 1, function(upgradeDb) {
      const storeOptions = {keyPath: 'id'};
      upgradeDb.createObjectStore('restaurants', storeOptions);
    });
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   *
   * @param {function} callback Callback function.
   * @returns {void}
   */
  static fetchRestaurants(callback) {
    const dbPromise = DBHelper.openDatabase();
    return dbPromise.then(function(db) {
      const tx = db.transaction('restaurants');
      const store = tx.objectStore('restaurants');
      return store.getAll();
    }).then(function(restaurants) {
      if (restaurants.length < 1) {
        fetch(DBHelper.DATABASE_URL).then(function(response) {
          return response.json();
        }).then(function(data) {
          dbPromise.then(function(db) {
            const tx = db.transaction('restaurants', 'readwrite');
            const store = tx.objectStore('restaurants');
            data.forEach(function(restaurant) {
              store.put(restaurant);
            });
          });
          callback(null, data);
        }).catch(function(error) {
          callback(error, null);
        });
      } else {
        callback(null, restaurants);
      }
    });
  }

  /**
   * Fetch a restaurant by its ID.
   *
   * @param {integer} id        Restaurant id.
   * @param {function} callback Callback function.
   * @returns {void}
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   *
   * @param {Object} cuisine    Cuisine.
   * @param {function} callback Callback function.
   * @returns {void}
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   *
   * @param {Object} neighborhood Neighborhood.
   * @param {function} callback   Callback function.
   * @returns {void}
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   *
   * @param {Object} cuisine      Cuisine.
   * @param {Object} neighborhood Neighborhood.
   * @param {function} callback   Callback function.
   * @returns {void}
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   *
   * @param {function} callback Callback function.
   * @returns {void}
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   *
   * @param {function} callback Callback function.
   * @returns {void}
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   *
   * @param {Object} restaurant Restaurant.
   * @returns {string}          Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   *
   * @param {Object} restaurant Restaurant.
   * @returns {string}           Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}.jpg`;
  }

  /**
   * Restaurant image URL.
   *
   * @param {Object} restaurant Restaurant.
   * @param {integer} width     Image width.
   * @returns {string}          Restaurant image URL.
   */
  static imageResponsiveUrlForRestaurant(restaurant, width) {
    return `/img-responsive/${restaurant.photograph}-${width}_x1.jpg`;
  }

  /**
   * Map marker for a restaurant.
   *
   * @param {Object} restaurant    Restaurant.
   * @param {Object} map           Map.
   * @returns {google.maps.Marker} Marker object.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }

}
