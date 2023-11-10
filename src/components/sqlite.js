/* eslint-disable */
export const crearTablas = () => {
    var request = indexedDB.open('db_foliadas', 1);
  
    request.onupgradeneeded = function (event) {
      var db = event.target.result;
  
      var listaFoliosStore = db.createObjectStore('lista_folios', { autoIncrement: true });
      listaFoliosStore.createIndex('folio', 'folio', { unique: false });
      listaFoliosStore.createIndex('cliente', 'cliente', { unique: false });
      listaFoliosStore.createIndex('direccion', 'direccion', { unique: false });
      listaFoliosStore.createIndex('fecha', 'fecha', { unique: false });
      listaFoliosStore.createIndex('tasa0', 'tasa0', { unique: false });
      listaFoliosStore.createIndex('tasa16', 'tasa16', { unique: false });
      listaFoliosStore.createIndex('tasa8', 'tasa8', { unique: false });
      listaFoliosStore.createIndex('total', 'total', { unique: false });
      listaFoliosStore.createIndex('tienda', 'tienda', { unique: false });
  
      var remisionesStore = db.createObjectStore('remisiones', { autoIncrement: true });
      remisionesStore.createIndex('folio', 'folio', { unique: false }); // Índice para búsqueda por producto
      remisionesStore.createIndex('producto', 'producto', { unique: false }); // Índice para búsqueda por producto
      remisionesStore.createIndex('cantidad', 'cantidad', { unique: false });
      remisionesStore.createIndex('empaque', 'empaque', { unique: false });
      remisionesStore.createIndex('precio', 'precio', { unique: false });
      remisionesStore.createIndex('total', 'total', { unique: false });
      remisionesStore.createIndex('tasa', 'tasa', { unique: false });
      remisionesStore.createIndex('tienda', 'tienda', { unique: false });
    };
  
    request.onsuccess = function(event) {
      console.log('Base de datos correcta.');    
    };
  
    request.onerror = function(event) {
      console.error('Error al abrir la base de datos: ' + event.target.errorCode);
    };
  }
  
  export const insertarDatos = (lista_remision, remisiones) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('db_foliadas', 1);
  
      /* request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('lista_folios', { keyPath: 'folio' });
        db.createObjectStore('remisiones', { autoIncrement: true });
      }; */
  
      request.onsuccess = function(event) {
        const db = event.target.result;
  
        const insertarListaFolios = () => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction('lista_folios', 'readwrite');
            const listaFoliosStore = transaction.objectStore('lista_folios');
  
            lista_remision.forEach(item => {
              const request = listaFoliosStore.add(item);
              request.onsuccess = function(event) {
                resolve();
              };
              request.onerror = function(event) {
                reject(event.target.error);
              };
            });
          });
        };
  
        const insertarRemisiones = () => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction('remisiones', 'readwrite');
            const remisionesStore = transaction.objectStore('remisiones');
  
            remisiones.forEach(item => {
              const request = remisionesStore.add(item);
              request.onsuccess = function(event) {
                resolve();
              };
              request.onerror = function(event) {
                reject(event.target.error);
              };
            });
          });
        };
  
        insertarListaFolios()
          .then(() => insertarRemisiones())
          .then(() => {
            resolve('Datos insertados correctamente.');
          })
          .catch(error => {
            reject(error);
          });
      };
  
      request.onerror = function(event) {
        reject(event.target.errorCode);
      };
    });
  };
  
  
  export const formataerTablas = () => {
    var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('delete from  lista_folios ');
      tx.executeSql('delete from  remisiones ');
    }, (e) => console.log(e.message),
      () => console.log('formateo correcto'));
  }
  
  export const folioMax = async (tienda) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('db_foliadas', 1);
  
      request.onerror = function(event) {
        reject(event.target.error);
      };
  
      request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction('lista_folios', 'readonly');
        const listaFoliosStore = transaction.objectStore('lista_folios');
        const index = listaFoliosStore.index('tienda');
        const keyRange = IDBKeyRange.only(tienda);
        const cursorRequest = index.openCursor(keyRange, 'prev');
  
        let folio = 0;
  
        cursorRequest.onsuccess = function(event) {
          const cursor = event.target.result;
          if (cursor) {
            const record = cursor.value;
            if (record.folio > folio) {
              folio = record.folio;
            }
            cursor.continue();
          } else {
            resolve(folio);
            db.close();
          }
        };
  
        cursorRequest.onerror = function(event) {
          reject(event.target.error);
        };
      };
    });
  };
  
  
  export const reimprimir = (tienda, fecha) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('db_foliadas', 1);
  
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('lista_folios', { keyPath: 'folio' });
        db.createObjectStore('remisiones', { keyPath: 'folio' });
      };
  
      request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['lista_folios', 'remisiones'], 'readonly');
        const listaFoliosStore = transaction.objectStore('lista_folios');
        const remisionesStore = transaction.objectStore('remisiones');
        const remisiones = [];
  
        const listaFoliosRequest = listaFoliosStore.index('tienda').getAll(tienda);
        listaFoliosRequest.onsuccess = function(event) {
          const listaFoliosResult = event.target.result.filter(item => item.fecha === fecha);
          if (listaFoliosResult.length === 0) {
            resolve(0);
          } else {
            let count = 0;
            listaFoliosResult.forEach(item => {            
              const remisionesRequest = remisionesStore.index('tienda').getAll(tienda);
              remisionesRequest.onsuccess = function(event) {                            
                const remisionesResult = event.target.result.filter(itemRemi => item.folio === itemRemi.folio);
                remisiones.push(...remisionesResult);
                count++;
                if (count === listaFoliosResult.length) {
                  resolve({ 'listaRemision': listaFoliosResult, 'remisiones': remisiones });
                }
              };
              remisionesRequest.onerror = function(event) {
                reject(event.target.error);
              };
            });
          }
        };
  
        listaFoliosRequest.onerror = function(event) {
          reject(event.target.error);
        };
      };
  
      request.onerror = function(event) {
        reject(event.target.errorCode);
      };
    });
  };
  
  
  export const reimprimirUno = (tienda, folio) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('db_foliadas', 1);
  
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('lista_folios', { keyPath: 'folio' });
        db.createObjectStore('remisiones', { keyPath: 'folio' });
      };
  
      request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['lista_folios', 'remisiones'], 'readonly');
        const listaFoliosStore = transaction.objectStore('lista_folios');
        const remisionesStore = transaction.objectStore('remisiones');
        const remisiones = [];
  
        const listaFoliosRequest = listaFoliosStore.index('tienda').getAll(tienda);
        listaFoliosRequest.onsuccess = function(event) {
          const listaFoliosResult = event.target.result.filter(item => item.folio === folio);
          if (listaFoliosResult.length === 0) {
            resolve(0);
          } else {
            let count = 0;
            listaFoliosResult.forEach(item => {
              const remisionesRequest = remisionesStore.index('tienda').getAll(tienda);
              remisionesRequest.onsuccess = function(event) {
                const remisionesResult = event.target.result.filter(itemRemi => item.folio === itemRemi.folio);
                remisiones.push(...remisionesResult);
                count++;
                if (count === listaFoliosResult.length) {
                  resolve({ 'listaRemision': listaFoliosResult, 'remisiones': remisiones });
                }
              };
              remisionesRequest.onerror = function(event) {
                reject(event.target.error);
              };
            });
          }
        };
  
        listaFoliosRequest.onerror = function(event) {
          reject(event.target.error);
        };
      };
  
      request.onerror = function(event) {
        reject(event.target.errorCode);
      };
    });
  };
  
  
  export const borrarTablas = () => {
    var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('drop table lista_folios ');
      tx.executeSql('drop table remisiones ');
    }, (e) => console.log(e.message),
      () => console.log('formateo correcto'));
  }