/* eslint-disable */
import React from 'react';
import './App.css';

import {useEffect, useState} from 'react'
import logoComer from './img/logo_comer.png'
import home_img from './img/home.svg'
import report_img from './img/report.svg'
import printer from './img/printer.svg'

import * as ObtenerNotas from './components/obtenerNotas'
import * as Sqlite from './components/sqlite'
import { Reimprimir } from './components/reimprimir'
import * as urlVercel from './components/urls'

function App() {

  const [datosCapturados,setDatosCapturados] = useState ({'tienda':'nada','total':'','iva':'','ieps':'','notas':'','excedente':'', 'fecha':''})
  const [productos, setProductos] = useState([])
  const [empaques, setEmpaques] = useState([])
  const [clientes, setClientes] = useState([])
  const [listaRemision_Creada, setlistaRemision_Creada] = useState([])
  const [remisiones_Creadas, setRemisiones_Creadas] = useState([])  
  const [reimprimirListaRemision, setReimprimirListaRemision] = useState([])
  const [reimprimirRemisiones, setRemprimirRemisiones] = useState([])  
  const [imprimir, setImprimir] = useState(false)
  const [reimprimir, setReimprimir] = useState(false)
  const [mostrarUno, setMostrarUno] = useState(false) //no mostrar la lista de reimpresion individual de notas
  const [folio, setFolio] = useState(0)
  const [modificarFolio, setModificarFolio] = useState(false)
  const [mostrarSql, setMostrarSql ] = useState (false)
  
  const leerDatos = async () =>{
    setEmpaques([])
    let clientes = await fetch(urlVercel.Urlclientes)
    let datos = await clientes.json()
    setClientes(datos)    

    let response = await fetch(urlVercel.Urlcnventario)        
    let data = await response.json()           
    setProductos(data)

    response = await fetch(urlVercel.Urlpaquete  )        
    data = await response.json()       
    setEmpaques(data) 
  }

  const obtenerDatos = () =>{
    let error = ''
    let total = parseFloat(datosCapturados.total)
    let iva = parseFloat(datosCapturados.iva)
    let ieps = parseFloat(datosCapturados.ieps)
    let notas = parseInt(datosCapturados.notas)
  
    setMostrarUno(false) // oculta lista de reimpresion individual si esta visible 
   
    if (datosCapturados.fecha.length === 0)
      error ='necesitas seleccionar fecha \n'
  
    if (datosCapturados.tienda === 'nada')
      error += 'necesitas seleccionar tienda \n'
    
    if (total<1 ||  datosCapturados.total.length === 0)
      error += 'necesitas total \n'
  
    if (iva>total ||  datosCapturados.iva.length === 0)
      error += 'Error con el IVA \n'
  
    if (ieps>total ||  datosCapturados.ieps.length === 0)
      error += 'Error con el IEPS \n'
  
    if ((iva + ieps)>total)
      error += 'La suma de IVA e IEPS supera a la cantidad total \n'
    
    if (notas<1 || datosCapturados.notas.length === 0)
      error += 'Pon el numero de notas que necesitas \n'
    
    if (datosCapturados.excedente.length === 0)
      error += 'Pon el total excedente permitido por nota'      
  
    if (error) 
      alert(error)
    else //despues de validar la informacion hacemos los calculos
      {
        //Verifico que no se haya hecho foliadas ese dia  
        let fe = datosCapturados.fecha
        //2021/10/15
        let ordernaFecha = fe[8]+fe[9]+'-'+fe[5]+ fe[6]+'-'+fe[0]+ fe[1]+ fe[2]+ fe[3] 
    
        Sqlite.reimprimir(datosCapturados.tienda,ordernaFecha).then(e =>{                        
          if (e === 0) {
            const {listaRemisiones, remisiones} =ObtenerNotas.obtenerNotas(datosCapturados,productos,empaques,folio,clientes)                      
            setlistaRemision_Creada(listaRemisiones)
            setRemisiones_Creadas(remisiones)            
          }
          else{
            alert('Ya se hizo foliadas de este dia')            
          }
        })
         
      }
  
  }

  const changeBack = (e) =>{
    e.target.style.background === 'blue' ?
      e.target.style.background = '#6C63FF'
    :
      e.target.style.background = 'blue'
  
  }

  useEffect(() =>{
    leerDatos()    
  },[]) 

  

  const ordernarFecha = (fecha) =>{    
    const mes=['enero','febrero','marzo','abril','mayo','junio','julio','agosto', 'septiembre','octubre', 'noviembre','diciembre']
    //2021/10/15    
    let indexMes = fecha[5]+ fecha[6]
    let orden = fecha[8]+fecha[9]+'-'+mes[parseInt(indexMes)-1]+'-'+fecha[0]+ fecha[1]+ fecha[2]+ fecha[3]
    return(orden)
  }

  const limpiar = () =>{
    setDatosCapturados({'tienda':'nada','total':'','iva':'','ieps':'','notas':'','excedente':'', 'fecha':''})
    setlistaRemision_Creada([])
    setRemisiones_Creadas([])
    setReimprimirListaRemision([])
    setRemprimirRemisiones([])
    setImprimir(false)
    setReimprimir(false)
    setMostrarUno(false)
    setFolio(0)
    setModificarFolio(false)    
  }

  const regresar = () => { 
    limpiar()
  }

  const regresarReimpresion = () =>{
    let fe = datosCapturados.fecha    
    let ordernaFecha = fe[8]+fe[9]+'-'+fe[5]+ fe[6]+'-'+fe[0]+ fe[1]+ fe[2]+ fe[3] 
    Sqlite.reimprimir(datosCapturados.tienda,ordernaFecha).then(e =>{              
        setReimprimirListaRemision(e.listaRemision)
        setRemprimirRemisiones(e.remisiones)              
    })

    setImprimir(false)
    setReimprimir(false)
    setFolio(0)
    setModificarFolio(false)
  }

  const reimprimirNotas = () =>{    
    setlistaRemision_Creada('')
    let fe = datosCapturados.fecha
    //2021/10/15
    let ordernaFecha = fe[8]+fe[9]+'-'+fe[5]+ fe[6]+'-'+fe[0]+ fe[1]+ fe[2]+ fe[3] 

    Sqlite.reimprimir(datosCapturados.tienda,ordernaFecha).then(e =>{        
      if (e === 0) alert('No hay datos para mostrar')    
      else{
        setReimprimirListaRemision(e.listaRemision)
        setRemprimirRemisiones(e.remisiones)
        setMostrarUno(false) //no mostrar la lista de reimpresion individual de notas
        setReimprimir(true) 
      }
    })
        
  }

  const listaReimprimirUno = () =>{        
    setlistaRemision_Creada('')
    let fe = datosCapturados.fecha
    ordernarFecha(fe)
    //2021/10/15
    let ordernaFecha = fe[8]+fe[9]+'-'+fe[5]+ fe[6]+'-'+fe[0]+ fe[1]+ fe[2]+ fe[3] 

    Sqlite.reimprimir(datosCapturados.tienda,ordernaFecha).then(e =>{              
      if (e === 0) {
        setReimprimirListaRemision([])
        setRemprimirRemisiones([])   
        alert('No hay datos para mostrar')    
      }
      else{
        setReimprimirListaRemision(e.listaRemision)
        setRemprimirRemisiones(e.remisiones)        
        setMostrarUno(true)
      }
    })
        
  }

  const reimprimirUno = (tienda, folio) =>{    
    Sqlite.reimprimirUno(tienda,folio).then(e =>{        
      if (e === 0) alert('No hay datos para mostrar')    
      else{
        setReimprimirListaRemision(e.listaRemision)
        setRemprimirRemisiones(e.remisiones)
        setReimprimir(true) 
      }
    })        
  }

  const ejecutarSQL = (query) => {
    Sqlite.EjecutarSQL(query).then( e =>{
      console.log(e);
    })
  }

  const leerFolio = async(tienda)=>{    
    setFolio(await Sqlite.folioMax(tienda))    
  }   

  const guardarFoliadas = () =>{       
   
      setImprimir(true)
      Sqlite.crearTablas()
      Sqlite.insertarDatos(listaRemision_Creada,remisiones_Creadas)
    
      //Sqlite.borrarTablas()
  }

  const convertirAPesos = (cantidad) =>{
    let pesos = cantidad    
    return(pesos.toLocaleString('es-MX', {style: 'currency',currency: 'MXN', minimumFractionDigits: 2}))
  }

  const cabecera_matriz = (ancho_pantalla) =>{
    return(
      <div className='encabezados'>
        <p style={{fontWeight:'bold',textAlign:'center',fontSize:'11px'}}>GRUPO ABARROTERO SAN MARTIN SA DE CV</p>
        <p>RFC: GAS-020807-TG0</p>
        <p>AV. CENTRAL SUR NUM. 25</p>
        <p>TEL: 963-63-6-02-23</p>
        <p>LAS MARGARITAS, CHIAPAS</p>
        <br/>
        <div style={{display:'flex',justifyContent:'flex-end',width:ancho_pantalla}}>
          <p>CONDICION: CONTADO</p>
        </div>        
      </div>
    )
  }

  const cabecera_mercado = (ancho_pantalla) =>{
    return(
      <div className='encabezados'>
        <p style={{fontWeight:'bold',textAlign:'center',fontSize:'13px'}}>CP OSCAR ORLANDO ARGUELLO GORDILLO</p>
        <p> ABARROTES MERCADO </p>
        <p>RFC: AUGO860221D33</p>
        <p>2A AV. ORIENTE NORTE NUM. 15</p>
        <p>TEL: 963-63-6-08-54</p>
        <p>CELULAR: 963-13-8-90-90</p>
        <p>LAS MARGARITAS, CHIAPAS</p>
        <br/>
        <div style={{display:'flex',justifyContent:'flex-end',width:ancho_pantalla}}>
          <p>CONDICION: CONTADO</p>
        </div>        
      </div>
    )
  }

  const cabecera_lorena = (ancho_pantalla) =>{
    return(
      <div className='encabezados'>
        <p style={{fontWeight:'bold',textAlign:'center',fontSize:'14px'}}>LUZ LORENA ARGUELLO GORDILLO</p>
        <p> GRUPO ABARROTERO SAN MARTIN </p>
        <p> SUCURSAL "LORENA" </p>
        <p>RFC: AUGL-891102-6T2</p>
        <p>CALLE CENTRAL ORIENTE No. 34</p>
        <p>TEL: 963-63-6-02-65</p>
        <p>LAS MARGARITAS, CHIAPAS</p>
        <br/>
        <div style={{display:'flex',justifyContent:'flex-end',width:ancho_pantalla}}>
          <p>CONDICION: CONTADO</p>
        </div>        
      </div>
    )
  }

  const cabecera_comercial = (ancho_pantalla) =>{
    return(
      <div className='encabezados'>
        <p style={{fontWeight:'bold',textAlign:'center',fontSize:'14px'}}>CP OSCAR ORLANDO ARGUELLO GORDILLO</p>        
        <p> ABARROTES LA COMERCIAL </p>
        <p>RFC: AUGO860221D33</p>
        <p>2A. CALLE NORTE ORIENTE No.22</p>
        <p>TEL: 63-6-08-66</p>
        <p>LAS MARGARITAS, CHIAPAS</p>
        <br/>
        <div style={{display:'flex',justifyContent:'flex-end',width:ancho_pantalla}}>
          <p>CONDICION: CONTADO</p>
        </div>        
      </div>
    )
  }

  const pantalla_principal = 
    <div>
            <div className="topnav">
              <a onClick={() => limpiar()}>Limpiar</a>
              <a onClick={() => reimprimirNotas()}>Reimprimir todo</a>              
              <a onClick={() => listaReimprimirUno()}>Reimprimir uno</a>              
            </div>

            <div className='cabecera'>      
              <img src={logoComer} className='logo-GASM'  alt="logo" />
              <p className='texto_cabecera'> Foliadas </p>
            </div>            
          
            
            <div className='seccion_calculos' > 
              <div className='fila'>
                  <img src={home_img} className='logo-home'  alt="home" />       
                  <div className='mandar_abajo '>
                    <div className='columna'>
                      <div style={{display:'flex',justifyContent:'flex-end'}}>
                        <input type="date"  className='caja_texto_tienda' style={{width: '220px'}} value={datosCapturados.fecha}
                          onChange={(e) => setDatosCapturados({...datosCapturados,'fecha':e.target.value})}/>
                      </div>
                      
                      <select className='caja_texto_tienda' placeholder='Tienda' type="search" value={datosCapturados.tienda}
                        onChange={(e) => {
                          setDatosCapturados({...datosCapturados,'tienda':e.target.value})
                          leerFolio(e.target.value)                         
                        }}

                        
                      >
                        <option value="nada">Seleccione la tienda</option>
                        {/* <option value="matriz">Matriz</option> */}
                        <option value="mercado">Mercado</option>
                        <option value="comercial">La comercial</option>
                        {/* <option value="lorena">Lorena</option> */}
                      </select>

                      <div className='fila' style={{alignItems:'center'}}>
                      {modificarFolio ? //desabilito el folio si es mayor a 0
                          <input type='number' className='caja_texto_tienda' style={{width: '120px'}} value={folio} 
                          onChange={e => setFolio(e.target.value)}/>
                       : 
                          <input type='number' className='caja_texto_tienda' style={{width: '120px'}} value={folio} readOnly
                          onChange={e => setFolio(e.target.value)}/>}
                        
                        <p className='texto' onClick={() => setModificarFolio(true)}>ultimo folio </p>
                      </div>
                      
                    </div>
                  </div>
              </div>
              <div className='fila' style={{marginLeft:'50px'}}>
                <div className='centrar_imagen'>
                  <img src={report_img} className='logo-report'  alt="report" />       
                </div>
                <div className='columna'>
                  <input type='number' placeholder='Total' className='caja_texto' style={{width:'299px',height:'30px'}} value={datosCapturados.total} 
                      onChange={(e) => setDatosCapturados({...datosCapturados,'total':e.target.value})
                    } 
                  />
                  <input type='number' placeholder='IVA' className='caja_texto' style={{width:'299px',height:'30px'}}  value={datosCapturados.iva}
                      onChange={(e) => setDatosCapturados({...datosCapturados,'iva':e.target.value})
                    } 
                  />
                  <input type='number' placeholder='IEPS'className='caja_texto' style={{width:'299px',height:'30px'}} value={datosCapturados.ieps}
                      onChange={(e) => setDatosCapturados({...datosCapturados,'ieps':e.target.value})
                    } 
                  />
                  
                  <input type='number' placeholder='Numero de notas'className='caja_texto' style={{width:'299px',height:'30px'}} value={datosCapturados.notas}
                      onChange={(e) => setDatosCapturados({...datosCapturados,'notas':e.target.value})
                    } 
                  />
                  <input type='number' placeholder='Excedente permitido' className='caja_texto' style={{width:'299px',height:'30px'}} value={datosCapturados.excedente}
                      onChange={(e) => setDatosCapturados({...datosCapturados,'excedente':e.target.value})
                    } 
                  />
                </div>
              </div>
            </div>

            <div>
              <button className='boton' 
                onClick={() => obtenerDatos()} 
                onMouseEnter={(e) => changeBack(e)}
                onMouseLeave={(e) => changeBack(e)}
              >Crear</button>

              <p className='texto_sql'
                onClick={() => setMostrarSql(!(mostrarSql))}>ejecutar SQL</p>
            </div>
            
            {mostrarSql ?
              <div id = 'espacio_sql' >
                <textarea className='caja_texto' id = 'btn_ejecutar_sql'
                  style={{height: '100px'}}/>

                <button className='boton' 
                  onClick={() => ejecutarSQL(document.getElementById('btn_ejecutar_sql').value)}                 
                >Ejecutar</button>
                
              </div>
              : null
            }

    </div>

const mostrarListaRemisiones = () =>{    
  let total=0, iva = 0, ieps = 0, folioini=0, foliofin=0
  let ancho_pantalla = '350px', letra_chica = '13px'
  let resul=
  <div>
                          
          <button className='boton' 
            onClick={() => regresar()} 
            onMouseEnter={(e) => changeBack(e)}
            onMouseLeave={(e) => changeBack(e)}                  
          >regresar</button>                     
          

          <div style={{width:ancho_pantalla}}> {/* ancho de la hoja de impresion */}
              {listaRemision_Creada.map((item, index) =>  <div key={index}>                                                  
                                                  
                                                  <div style={{display:'none'}}> {/* muestra en pantalla los acumuladores */}
                                                      {index === 0 ? folioini = item.folio : foliofin = item.folio}
                                                      { iva += item.tasas.tasa16}
                                                      { ieps += item.tasas.tasa8 }
                                                      { total += item.total}
                                                  </div>

                                                  {/* verifico que tienda es para poner su encabezado */}
                                                  { datosCapturados.tienda ==='matriz' ? cabecera_matriz(ancho_pantalla) : null}
                                                  { datosCapturados.tienda ==='mercado' ? cabecera_mercado(ancho_pantalla) : null}
                                                  { datosCapturados.tienda ==='lorena' ? cabecera_lorena(ancho_pantalla) : null}
                                                  { datosCapturados.tienda ==='comercial' ? cabecera_comercial(ancho_pantalla) : null}
                                                  
                                                  <p className='lista_remision_cliente' style={{fontWeight:'bold'}}> {item.cliente} </p>
                                                  <div style={{display:'flex',justifyContent:'space-around',fontSize:letra_chica}}>                                                        
                                                      <p className='lista_remision_fecha'> {item.fecha} </p>                                                         
                                                      <p className='lista_remision_folio'> FOLIO:  {item.folio} </p>                                                        
                                                  </div>
                                                  <div>
                                                      <hr></hr>
                                                      {remisiones_Creadas.map((item2, index2) =>
                                                          (item2.folio === item.folio) ?
                                                              <div key={index2}>
                                                                  <div className='fila' >
                                                                      <p className='remisiones_cantidad'> {item2.cantidad} </p>
                                                                      <p className='remisiones_producto'> {item2.empaque} {item2.producto} </p>                                                                        
                                                                  </div>
                                                                  <div className='fila' style={{width:ancho_pantalla,display:'flex',justifyContent:'space-between'}} >                                                                        
                                                                      <p style={{marginLeft:'40px', fontSize:letra_chica}} >Tasa: {item2.tasa}% </p>            
                                                                      <p className='remisiones_total' style={{marginRight:'15px'}}>$ {item2.total.toFixed(2)} </p> 
                                                                  </div>
                                                              </div>
                                                          :
                                                              null
                                                            )}
                                                      <hr></hr>

                                                      <div className='fila' style={{fontSize:letra_chica}}>
                                                          <p className='lista_remision_total'> TASA 0%: $ </p> 
                                                          <p className='lista_remision_total' style={{width:'150px'}}> {item.tasas.tasa0.toFixed(2)} </p> 
                                                      </div>
                                                      <div className='fila' style={{fontSize:letra_chica}}>
                                                          <p className='lista_remision_total'> IVA: $ </p> 
                                                          <p className='lista_remision_total' style={{width:'150px'}}> {item.tasas.tasa16.toFixed(2)} </p> 
                                                      </div>
                                                      <div className='fila' style={{fontSize:letra_chica}}>
                                                          <p className='lista_remision_total'> IEPS: $ </p> 
                                                          <p className='lista_remision_total' style={{width:'150px'}}> {item.tasas.tasa8.toFixed(2)} </p> 
                                                      </div>
                                                      <div className='fila'style={{fontWeight:'bold'}}>
                                                          <p className='lista_remision_total'> TOTAL: $ </p> 
                                                          <p className='lista_remision_total' style={{width:'150px'}}> {item.total.toFixed(2)} </p> 
                                                      </div>

                                                      <div>
                                                        <p style={{textAlign:'center',marginBottom:'50px'}}>GRACIAS POR SU COMPRA</p>
                                                      </div>
                                                      
                                                  </div>
                                              </div>)
              }
              <p > ** {datosCapturados.tienda} ** </p>
              <p >{ordernarFecha(datosCapturados.fecha)}</p>
              <p >Folios: {folioini} - {foliofin}</p>
              <p >Total: {convertirAPesos(total)}</p>                  
              <p >-- Tasa 0: {convertirAPesos(total-iva-ieps)}</p>
              <p >-- IVA:    {convertirAPesos(iva)}</p>
              <p >-- IEPS:   {convertirAPesos(ieps)}</p>

              <div>                 
                <button className='boton' 
                  onClick={() => regresar()} 
                  onMouseEnter={(e) => changeBack(e)}
                  onMouseLeave={(e) => changeBack(e)}                  
                >regresar</button>                     
              </div>              
    </div>      
  </div>
  
  //necesito regresar las notas creadas en resul
  //y el desglose de los totales en total iva e ipes porque useState renderiza muchas veces y no funciono
  return({resul:resul,total:total, iva:iva, ieps:ieps})                                          
}

const listaIndividual = () => {
  let resul = '', folioini= '', foliofin=''
  let total=0, iva = 0, ieps = 0
  resul = reimprimirListaRemision.map( (item, index) => {
    if (index === 0) folioini = item.folio //folio inicial
    iva += parseFloat(item.tasa16)
    ieps += parseFloat(item.tasa8 )
    total += parseFloat(item.total)
    foliofin = item.folio

    return(<p key={index} className='lista_impresion' onClick={() => reimprimirUno(item.tienda,item.folio)}>
        {item.folio} - {item.cliente} - $ {parseFloat(item.total).toFixed(2)} 
        <img src={printer} style={{height:'25px', width:'25px',marginLeft:'20px'}}  
          alt="printer" 
        /> 
      </p>
    )
  })    
 
   return({'resul':resul,'total':total,'tasa0':(total-iva-ieps),'iva':iva,'ieps':ieps,'folioini':folioini,'foliofin':foliofin})
}




    return (
     <div className="App">
     {empaques.length === 0 ? 
          //pantalla de carga
          <div className='App-header'>
            <img src={logoComer} className='carga_inicio'  alt="ini" />
            <p  className='texto_inicio'> cargando datos </p>            
          </div>
        :
          <div>
            {/* para imprimir quito la pantalla principal */}                        
            { !imprimir && !reimprimir ? 
                <div>
                {pantalla_principal}
                
                {/* lista de remisiones para elegir cual reimprimir individualmente */}
                {mostrarUno ?                    
                <div>                  
                  <p className='texto'> {datosCapturados.tienda} {ordernarFecha(datosCapturados.fecha)}</p>
                  <p className='texto'>Folios: {listaIndividual().folioini} - {listaIndividual().foliofin}</p>
                  <p className='texto'>Total: {convertirAPesos(listaIndividual().total)}</p>                  
                  <p className='texto'>-- Tasa 0: {convertirAPesos(listaIndividual().tasa0)}</p>
                  <p className='texto'>-- IVA: {convertirAPesos(listaIndividual().iva)}</p>
                  <p className='texto'>-- IEPS: {convertirAPesos(listaIndividual().ieps)}</p>                      
                  
                  {listaIndividual().resul}
                </div>
                :
                  null
                 }
                </div>
              :               
                null
            }

            { imprimir ? //lista de notas creadas para imprimir
              mostrarListaRemisiones().resul 
              
            : null
            }

            {/* el boton de imprimir aparece si hay remisiones creadas */}
            {listaRemision_Creada.length && !imprimir ?
            <div>
                {/* informacion de las notas */}
                <div style={{lineHeight:'5px'}}>
                    <p className='texto_inicio' style={{fontSize:'20px',color:'rgba(6, 4, 31, 0.81)'}}>Numero de notas: {listaRemision_Creada.length} </p>
                    <p className='texto_inicio' style={{fontSize:'20px',color:'rgba(6, 4, 31, 0.81)'}}>total: {convertirAPesos(mostrarListaRemisiones().total)} </p>
                    <p className='texto_inicio' style={{fontSize:'20px',color:'rgba(6, 4, 31, 0.81)'}}>tasa0: {convertirAPesos((mostrarListaRemisiones().total-mostrarListaRemisiones().iva-mostrarListaRemisiones().ieps))} - iva: {convertirAPesos(mostrarListaRemisiones().iva)} - ieps: {convertirAPesos(mostrarListaRemisiones().ieps)}</p> 
                </div>
                

                <button className='boton' 
                  onClick={() => guardarFoliadas()} 
                  onMouseEnter={(e) => changeBack(e)}
                  onMouseLeave={(e) => changeBack(e)}                  
                >imprimir</button>
                
            </div>
            :
                null
            }

            {reimprimir?   //nota individual para reimprimir                        
                <Reimprimir datosCapturados={datosCapturados} listaRemision={reimprimirListaRemision} remisiones={reimprimirRemisiones} regresar={regresarReimpresion} />             
            :
              null
            }
            
            {/*  {<button className='boton' 
                  onClick={() => Sqlite.borrarTablas()} 
                  onMouseEnter={(e) => changeBack(e)}
                  onMouseLeave={(e) => changeBack(e)}                  
                >borrar tablas</button>
            }  */}
            
        </div>
      }  
    </div>
    )
  }

export default App
