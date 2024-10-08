/* eslint-disable */
import React from 'react';
import './App.css';

import {useEffect, useState} from 'react'
import logoComer from './img/logo_comer.png'
import home_img from './img/home.svg'
import printer from './img/printer.svg'

import * as ObtenerNotas from './components/obtenerNotas'
import * as Sqlite from './components/sqlite'
import { Reimprimir } from './components/reimprimir'
import { inventario, empaque, clientesLocal } from './components/dataLocal';

function App() {

  const [datosCapturados,setDatosCapturados] = useState ({'tienda':'nada','fecha':'', 'fechaFin':''})
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
    //let clientes = await fetch('https://vercel-api-eta.vercel.app/api/clientes')
    //let datos = await clientes.json()
    setClientes(clientesLocal)    

    //let response = await fetch('https://vercel-api-eta.vercel.app/api/inventario')        
    //let data = await response.json()           
    setProductos(inventario)

    //response = await fetch('https://vercel-api-eta.vercel.app/api/empaque')        
    //data = await response.json()       
    setEmpaques(empaque) 
  }

  const crearNotas = () =>{
    let currentDate = new Date(datosCapturados.fecha);
    let finalDate = new Date(datosCapturados.fechaFin);
    let rangoFechas = [];
    let messageError = '';

    //le agrego un dia porque empieza en un dia anterior
    currentDate.setDate(currentDate.getDate() + 1);
    finalDate.setDate(finalDate.getDate() + 1);
      
    while (currentDate <= finalDate) {  
      const fechaStr = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
      if (currentDate.getDay() !== 0) {
        rangoFechas.push(fechaStr);//guardo la fecha sin el domingo
      } 
      currentDate.setDate(currentDate.getDate() + 1);     
    }
    
    //verifico que todas las fechas tengan creadas sus notas
    rangoFechas.forEach((item, index) =>{
      const numeroNotas = listaRemision_Creada[rangoFechas[index]] ? listaRemision_Creada[rangoFechas[index]].length : 0;
      if (numeroNotas == 0)
        messageError += rangoFechas[index]+', ';       
    })   

    //si hay error, no creo las foliadas
    if (messageError){
      messageError.slice(0, -2);
      messageError += 'no tienen datos';
      alert(messageError);
    }else{
      guardarFoliadas();      
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
    Sqlite.crearTablas()
  },[])  

  const ordernarFecha = (fecha) =>{    
    const mes=['enero','febrero','marzo','abril','mayo','junio','julio','agosto', 'septiembre','octubre', 'noviembre','diciembre']
    //2021/10/15    
    let indexMes = fecha[5]+ fecha[6]
    let orden = fecha[8]+fecha[9]+'-'+mes[parseInt(indexMes)-1]+'-'+fecha[0]+ fecha[1]+ fecha[2]+ fecha[3]
    return(orden)
  }

  const limpiar = () =>{
    setDatosCapturados({'tienda':'nada','fecha':'', 'fechaFin':''})
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
    const {folio, fecha} = await Sqlite.folioMax(tienda)

    console.log(folio)
    console.log(fecha)
    //setFolio(await Sqlite.folioMax(tienda).folio)        
  }   

  const actualizarFolios = () =>{
    let listaRemision = listaRemision_Creada;
    let remisiones = remisiones_Creadas;
    let indexLista = 1;
    let indexRemisiones = 1;
    let folioAnterior = 1;
    let folioActualizado = 0;

    for (const fecha in listaRemision) {      
      listaRemision[fecha].forEach((remision) => {
        remision.folio = indexLista + folio;        
        indexLista += 1;
      });     

      remisiones[fecha].forEach((remision) => {
        const folioActual = remision.folio;        
        if (folioAnterior == 0 || folioAnterior < folioActual){
          folioAnterior = folioActual;
          remision.folio = indexRemisiones + folio;
          indexRemisiones += 1;
        }else if(folioAnterior > folioActual){
          if (folioActual != folioActualizado){
            folioAnterior += 1;            
            folioActualizado = folioActual
          }
          remision.folio = folioAnterior;          
        }
      }); 
    }   

    return {listaRemision:listaRemision, remisiones:remisiones}
  }

  const guardarFoliadas = () =>{  
      const {listaRemision, remisiones} = actualizarFolios()
   
      //setImprimir(true)  
      console.log(listaRemision)
      console.log(remisiones)

      for (const fecha in listaRemision) {
        
        Sqlite.insertarDatos(listaRemision[fecha],remisiones[fecha]).then(x =>{
          console.log(fecha + 'agregado');
        })

      }

      /* Sqlite.insertarDatos(listaRemision,remisiones).then(x =>{
        console.log(fecha + ' agregado');
      }) */
    
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

  const handleInputChange = (fecha, e) => {    
    let value = e.target.value;    
    let campo = e.target.name;

    setDatosCapturados((prevState) => ({
      ...prevState,
      [fecha]: {
        ...prevState[fecha],
        [campo]: value,
      },
    }));
  };

  const obtenerDatosLinea = (fecha) => {
    const datos = datosCapturados[fecha];       
    
    if (datos && datos.total && datos.iva && datos.ieps && datos.notas && datos.excedente){
      datos.tienda = datosCapturados.tienda; 
      //dar formato año/mes/dia     
      const [dia, mes, año] = fecha.split('/');
      const nuevaFecha = `${año}/${mes}/${dia}`;
      datos.fecha = nuevaFecha;//  yyyy/mm/dd 
      datos.fechaNormal = fecha;//  dd/mm/yyyy      
      generarDatos(datos)
    }else{
      alert('Faltan datos');    
    }
    
  };

  const mostrarListaRemisiones = (fecha) =>{ 
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
                {listaRemision_Creada[fecha] && listaRemision_Creada[fecha].map((item, index) =>  <div key={index}>                                                  
                                                    
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
                                                        {remisiones_Creadas[fecha] && remisiones_Creadas[fecha].map((item2, index2) =>
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

  const generarDatos = (data) =>{
    let error = ''
    let total = parseFloat(data.total)
    let iva = parseFloat(data.iva)
    let ieps = parseFloat(data.ieps)
    let notas = parseInt(data.notas) 
    
   
    if (data.fecha.length === 0)
      error ='necesitas seleccionar fecha \n'
  
    if (data.tienda === 'nada')
      error += 'necesitas seleccionar tienda \n'
    
    if (total<1 ||  data.total.length === 0)
      error += 'necesitas total \n'
  
    if (iva>total ||  data.iva.length === 0)
      error += 'Error con el IVA \n'
  
    if (ieps>total ||  data.ieps.length === 0)
      error += 'Error con el IEPS \n'
  
    if ((iva + ieps)>total)
      error += 'La suma de IVA e IEPS supera a la cantidad total \n'
    
    if (notas<1 || data.notas.length === 0)
      error += 'Pon el numero de notas que necesitas \n'
    
    if (data.excedente.length === 0)
      error += 'Pon el total excedente permitido por nota'      
  
    if (error) 
      alert(error)
    else //despues de validar la informacion hacemos los calculos
      {
        
        const [dia, mes, año] = data.fechaNormal.split('/');
        // cambiar dd/mm/yyyy a dd-mm-yyyy para buscar en la bd
        const fechaParaBuscar = `${dia}-${mes}-${año}`; //
    
        //Verifico que no se haya hecho foliadas ese dia        
        Sqlite.reimprimir(data.tienda, fechaParaBuscar).then(e =>{                        
          if (e === 0) {
            const {listaRemisiones, remisiones} =ObtenerNotas.obtenerNotas(data,productos,empaques,folio,clientes)                      
            setlistaRemision_Creada((prev) => ({
                ...prev,
                [data.fechaNormal]:listaRemisiones
            }));
               
            setRemisiones_Creadas((prev) => ({
                ...prev,
                [data.fechaNormal]:remisiones
            }));             
          }
          else{
            alert('Ya se hizo foliadas de este dia')            
          }
        })
         
      }
  
  }

  const verificarDias = () =>{
    if (datosCapturados.fecha && datosCapturados.fechaFin && (datosCapturados.tienda != 'nada')){
      let currentDate = new Date(datosCapturados.fecha);
      let finalDate = new Date(datosCapturados.fechaFin);    
      let tienda = datosCapturados.tienda      

      while (currentDate <= finalDate) {  
        const ordernaFecha = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;                        
        Sqlite.reimprimir(tienda, ordernaFecha).then(e =>{                                                    
          console.log(e.listaRemision)
          if (e.listaRemision) {                  
            return 33
          }
        })
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return 0;

    }
    
  }

  const recorrerFechas = () => {
    let currentDate = new Date(datosCapturados.fecha);
    let finalDate = new Date(datosCapturados.fechaFin);
    let bloques = [];
    //le agrego un dia porque empieza en un dia anterior
    currentDate.setDate(currentDate.getDate() + 1);
    finalDate.setDate(finalDate.getDate() + 1);    
      
    while (currentDate <= finalDate) {  
      const fechaStr = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
      if (currentDate.getDay() !== 0) {        
        bloques.push(
          <div key={fechaStr} >
            <p className='texto_dias'>
              {fechaStr}
            </p>
            <div className='fila' style={{gap:'15px', marginBottom:'20px'}}>
              <input
                type='number'
                placeholder='Total'
                name='total'
                className='caja_texto'
                style={{ width: '120px', height: '25px' }}
                value={datosCapturados[fechaStr] && datosCapturados[fechaStr].total ? datosCapturados[fechaStr].total : ''}
                onChange={(e) =>
                  handleInputChange(fechaStr, e)
                }
              />
              <input
                type='number'
                placeholder='IVA'
                name='iva'
                className='caja_texto'
                style={{ width: '120px', height: '25px' }}
                value={datosCapturados[fechaStr] && datosCapturados[fechaStr].iva ? datosCapturados[fechaStr].iva : ''}
                onChange={(e) =>
                  handleInputChange(fechaStr, e)
                }
              />
              <input
                type='number'
                placeholder='IEPS'
                name='ieps'
                className='caja_texto'
                style={{ width: '120px', height: '25px' }}
                value={datosCapturados[fechaStr] && datosCapturados[fechaStr].ieps ? datosCapturados[fechaStr].ieps : ''}
                onChange={(e) =>
                  handleInputChange(fechaStr, e)
                }
              />
              <input
                type='number'
                placeholder='# notas'
                className='caja_texto'
                name='notas'
                style={{ width: '120px', height: '25px' }}
                value={datosCapturados[fechaStr] && datosCapturados[fechaStr].notas ? datosCapturados[fechaStr].notas : ''}
                onChange={(e) =>
                  handleInputChange(fechaStr, e)
                }
              />
              <input
                type='number'
                placeholder='Excedente'
                name='excedente'
                className='caja_texto'
                style={{ width: '120px', height: '25px' }}
                value={datosCapturados[fechaStr] && datosCapturados[fechaStr].excedente ? datosCapturados[fechaStr].excedente : ''}
                onChange={(e) =>
                  handleInputChange(fechaStr, e)
                }
              />

              <button className='boton_generar' 
                onClick={() => obtenerDatosLinea(fechaStr)}                 
              >Generar</button>
            </div>            

            {listaRemision_Creada[fechaStr] &&
              <div>
                <div style={{lineHeight:'5px'}}>
                  <p className='texto_inicio' style={{fontSize:'20px',color:'rgba(6, 4, 31, 0.81)'}}>Numero de notas: {listaRemision_Creada[fechaStr].length} </p>                  
                  <p className='texto_inicio' style={{fontSize:'20px',color:'rgba(6, 4, 31, 0.81)'}}>total: {convertirAPesos(mostrarListaRemisiones(fechaStr).total)} </p>
                  <p className='texto_inicio' style={{fontSize:'20px',color:'rgba(6, 4, 31, 0.81)'}}>tasa0: {convertirAPesos((mostrarListaRemisiones(fechaStr).total-mostrarListaRemisiones(fechaStr).iva-mostrarListaRemisiones(fechaStr).ieps))} - iva: {convertirAPesos(mostrarListaRemisiones(fechaStr).iva)} - ieps: {convertirAPesos(mostrarListaRemisiones(fechaStr).ieps)}</p> 
                </div>                
              </div>
            }

          </div>
        );
      }else{
        bloques.push(
          <div key={currentDate}>
            <p className='texto_dias'>
              {`${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`}
            </p>
            <p className='texto' style={{display:'flex', marginBottom:'15px'}}>Domingo</p>
          </div>
        )
      }
      currentDate.setDate(currentDate.getDate() + 1);      
    }
    
    return bloques;
  }

  const pantalla_principal = () => (
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
                      <div style={{display:'flex',justifyContent:'space-between'}}>
                        <div className='columna'>
                          <p className='texto'>Del:</p>
                          <input type="date"  className='caja_texto_tienda' style={{width: '180px', fontSize:'19px'}} value={datosCapturados.fecha}
                            onChange={(e) => setDatosCapturados({...datosCapturados,'fecha':e.target.value})}/>
                        </div>

                        <div style={{display:'flex', flexDirection:'column'}}>
                          <p className='texto'>al:</p>
                          <input type="date"  className='caja_texto_tienda' style={{width: '180px', fontSize:'19px'}} value={datosCapturados.fechaFin}
                            onChange={(e) => setDatosCapturados({...datosCapturados,'fechaFin':e.target.value})}/>
                        </div>
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
              <div className='fila'>                
                <div>
                  {recorrerFechas()}
                </div>
              </div>
            </div>

            <div>
              <button className='boton' style={{cursor:'pointer'}}
                onClick={() => crearNotas()}                 
              >Crear</button>

              <p className='texto_sql'
                onClick={() => setMostrarSql(!(mostrarSql))}>ejecutar SQL
              </p>

              <p className='texto_sql'
                onClick={() => recorrerFechas()}>ejecutar fechas
              </p>
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
  )

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
                {pantalla_principal()}
                
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
