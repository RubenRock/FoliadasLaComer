/* eslint-disable */
import React from 'react';
import '../App.css'

const changeBack = (e) =>{
    e.target.style.background === 'blue' ?
      e.target.style.background = '#6C63FF'
    :
      e.target.style.background = 'blue'

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

  const convertirAPesos = (cantidad) =>{
    let pesos = cantidad    
    return(pesos.toLocaleString('es-MX', {style: 'currency',currency: 'MXN', minimumFractionDigits: 2}))
  }

  const ordernarFecha = (fecha) =>{    
    const mes=['enero','febrero','marzo','abril','mayo','junio','julio','agosto', 'septiembre','octubre', 'noviembre','diciembre']
    //2021/10/15    
    let indexMes = fecha[5]+ fecha[6]
    let orden = fecha[8]+fecha[9]+'-'+mes[parseInt(indexMes)-1]+'-'+fecha[0]+ fecha[1]+ fecha[2]+ fecha[3]
    return(orden)
  }

export const Reimprimir = (props) =>{  
    let total=0, iva = 0, ieps = 0, folioini= 0, foliofin= 0
    let ancho_pantalla = '350px', letra_chica = '13px'
    let resul=
    <div>
                            
       
            <button className='boton' 
              onClick={() => props.regresar()} 
              onMouseEnter={(e) => changeBack(e)}
              onMouseLeave={(e) => changeBack(e)}                  
            >regresar</button>  
      
                <div style={{width:ancho_pantalla}}> {/* ancho de la hoja de impresion */}
                  {props.listaRemision.map((item, index) =>  
                    <div key={index}>                                                  
                                                      
                        <div style={{display:'none'}}> {/* muestra en pantalla los acumuladores */}
                            {index === 0 ? folioini = item.folio : foliofin = item.folio}
                            { iva += parseFloat(item.tasas.tasa16)}
                            { ieps += parseFloat(item.tasas.tasa8) }
                            { total += parseFloat(item.total)}
                        </div>
                        
                        {/* verifico que tienda es para poner su encabezado */}
                        { props.datosCapturados.tienda ==='matriz' ? cabecera_matriz(ancho_pantalla) : null}
                        { props.datosCapturados.tienda ==='mercado' ? cabecera_mercado(ancho_pantalla) : null}
                        { props.datosCapturados.tienda ==='lorena' ? cabecera_lorena(ancho_pantalla) : null}
                        { props.datosCapturados.tienda ==='comercial' ? cabecera_comercial(ancho_pantalla) : null}
                        
                        <p className='lista_remision_cliente' style={{fontWeight:'bold',fontSize:'12px'}}> {item.cliente} </p>
                        <div style={{display:'flex',justifyContent:'space-around',fontSize:letra_chica}}>                                                        
                            <p className='lista_remision_fecha'> {item.fecha} </p>                                                         
                            <p className='lista_remision_folio'> FOLIO:  {item.folio} </p>                                                        
                        </div>
                        <div>
                            <hr></hr>
                            {props.remisiones.map((item2, index2) =>
                                (item2.folio === item.folio) ?
                                    <div key={index2}>
                                        <div className='fila' >
                                            <p className='remisiones_cantidad'> {parseInt(item2.cantidad)} </p>
                                            <p className='remisiones_producto'> {item2.empaque} {item2.producto} </p>                                                                        
                                        </div>
                                        <div className='fila' style={{width:ancho_pantalla,display:'flex',justifyContent:'space-between'}} >                                                                        
                                            <p style={{marginLeft:'40px', fontSize:letra_chica}} >Tasa: {item2.tasa}% </p>
                                            <p className='remisiones_total' style={{marginRight:'15px'}}>$ {parseFloat(item2.total).toFixed(2)} </p> 
                                        </div>
                                    </div>
                                :
                                    null
                                  )}
                            <hr></hr>

                            <div className='fila' style={{fontSize:letra_chica}}>
                                <p className='lista_remision_total'> TASA 0%: $ </p> 
                                <p className='lista_remision_total' style={{width:'150px'}}> {parseFloat(item.tasas.tasa0).toFixed(2)} </p> 
                            </div>
                            <div className='fila' style={{fontSize:letra_chica}}>
                                <p className='lista_remision_total'> IVA: $ </p> 
                                <p className='lista_remision_total' style={{width:'150px'}}> {parseFloat(item.tasas.tasa16).toFixed(2)} </p> 
                            </div>
                            <div className='fila' style={{fontSize:letra_chica}}>
                                <p className='lista_remision_total'> IEPS: $ </p> 
                                <p className='lista_remision_total' style={{width:'150px'}}> {parseFloat(item.tasas.tasa8).toFixed(2)} </p> 
                            </div>
                            <div className='fila'style={{fontWeight:'bold'}}>
                                <p className='lista_remision_total'> TOTAL: $ </p> 
                                <p className='lista_remision_total' style={{width:'150px'}}> {parseFloat(item.total).toFixed(2)} </p> 
                            </div>

                            <div>
                              <p style={{textAlign:'center',marginBottom:'50px'}}>GRACIAS POR SU COMPRA</p>
                            </div>
                            
                        </div>
                    </div>)
                                                  
                  } 
                  <p > ** {props.datosCapturados.tienda} ** </p>
                  <p >{ordernarFecha(props.datosCapturados.fecha)}</p>
                  <p >Folios: {folioini} - {foliofin}</p>
                  <p >Total: {convertirAPesos(total)}</p>                  
                  <p >-- Tasa 0: {convertirAPesos(total-iva-ieps)}</p>
                  <p >-- IVA:    {convertirAPesos(iva)}</p>
                  <p >-- IEPS:   {convertirAPesos(ieps)}</p>
                  <div>                 
                    <button className='boton' 
                      onClick={() => props.regresar()} 
                      onMouseEnter={(e) => changeBack(e)}
                      onMouseLeave={(e) => changeBack(e)}                  
                    >regresar</button>                     
                  </div>
          </div>            
 

    </div>
    
    
    //necesito regresar las notas creadas en resul
    //y el desglose de los totales en totalm iva e ipes porque useState renderiza muchas veces y no funciono
    return(resul)                                          
    
  }