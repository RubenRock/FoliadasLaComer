/* eslint-disable */
export const crearTablas = () =>{
    var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS lista_folios (folio integer,cliente text, direccion text, fecha text, tasa0 text, tasa16 text, tasa8 text, total text,tienda text)');      
      tx.executeSql('CREATE TABLE IF NOT EXISTS remisiones (folio integer ,cantidad text, producto text, empaque text, precio text, total text, tasa text, tienda text)');      
    },(e)=> console.log(e.message),
    ()=> console.log('proceso correcto'));
}

export const insertarDatos = (lista_remision, remisiones) =>{
    var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);   

    lista_remision.forEach( item => {
        db.transaction(function (tx) {
            tx.executeSql('INSERT INTO lista_folios (folio, cliente,direccion, fecha, tasa0, tasa16, tasa8, total, tienda ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',[item.folio, item.cliente,item.direccion, item.fecha, item.tasas.tasa0, item.tasas.tasa16, item.tasas.tasa8, item.total, item.tienda]);
        },e => alert(e.message),
        () => console.log('guardado de lista de remisiones perfecto'))
    })
    
    remisiones.forEach(item =>{
        db.transaction(function (tx) {
            tx.executeSql('INSERT INTO remisiones (folio, cantidad, producto, empaque, precio, total, tasa, tienda) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',[item.folio, item.cantidad,item.producto, item.empaque, item.precio, item.total, item.tasa, item.tienda]);
        },e => alert(e.message),
        () => console.log('guardado de remisiones perfecto'))
    })
}

export const formataerTablas = () =>{
    var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('delete from  lista_folios ');      
      tx.executeSql('delete from  remisiones ');      
    },(e)=> console.log(e.message),
    ()=> console.log('formateo correcto'));
}

export const folioMax =  (tienda) => new Promise((resolve, reject) =>{ 
    let folio = 0     
    var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);
    db.transaction(
        tx => {               
            tx.executeSql('select max(folio) as foliomax from lista_folios where tienda = ? ',[tienda],(x,res)=>{
                folio = res.rows.item(0).foliomax                               
            if (folio > 0 )
                resolve(parseInt(folio))
            else
                resolve(0)
          })
        })       
  })


  export const reimprimir =  (tienda,fecha) => new Promise((resolve, reject) =>{
    let listaRemision =[], remisiones=[]  
    var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);
    db.transaction(
        tx => {               
            tx.executeSql('select * from lista_folios where tienda = ? and fecha = ? ',[tienda, fecha],(x,res)=>{
                let index = 0
                while (index < res.rows.length) {
                    listaRemision = [...listaRemision,res.rows.item(index)]
                    tx.executeSql('select * from remisiones where tienda = ? and folio = ? ',[tienda, res.rows.item(index).folio],(x,res)=>{
                        let index = 0
                        while (index < res.rows.length) {
                            remisiones = [...remisiones,res.rows.item(index)]
                            index++                             
                            }
                        })
                    index++                                  
                }                
            });
            
            })
            //resolve no espera que termine el while por eso le doy tiempo para resolver la funcion
            setTimeout(() => {                
                if (remisiones.length){                    
                    resolve({'listaRemision':listaRemision, 'remisiones':remisiones})
                }
                else
                    resolve(0)                
            }, 500);
    })

    export const reimprimirUno =  (tienda,folio) => new Promise((resolve, reject) =>{
        let listaRemision =[], remisiones=[]  
        var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);
        db.transaction(
            tx => {               
                tx.executeSql('select * from lista_folios where tienda = ? and folio = ? ',[tienda, folio],(x,res)=>{
                    let index = 0
                    while (index < res.rows.length) {
                        listaRemision = [...listaRemision,res.rows.item(index)]
                        tx.executeSql('select * from remisiones where tienda = ? and folio = ? ',[tienda, res.rows.item(index).folio],(x,res)=>{
                            let index = 0
                            while (index < res.rows.length) {
                                remisiones = [...remisiones,res.rows.item(index)]
                                index++                             
                                }
                            })
                        index++                                  
                    }                
                });
                
                })
                //resolve no espera que termine el while por eso le doy tiempo para resolver la funcion
                setTimeout(() => {                
                    if (remisiones.length){                    
                        resolve({'listaRemision':listaRemision, 'remisiones':remisiones})
                    }
                    else
                        resolve(0)                
                }, 500);
        })

  export const borrarTablas = () =>{
    var db = openDatabase('db_foliadas', '1.0', 'Foliadas', 2 * 1024 * 1024);
    db.transaction(function (tx) {
      tx.executeSql('drop table lista_folios ');      
      tx.executeSql('drop table remisiones ');      
    },(e)=> console.log(e.message),
    ()=> console.log('formateo correcto'));
}



