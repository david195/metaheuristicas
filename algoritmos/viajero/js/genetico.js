var generaciones = [];
/*
var nciudades = 10;
var distancia_origen = 50;
var tipo_grafo = 'circulo';
var tam_pob = 10;
var porcentaje_elitismo = 50;
var tipo_seleccion = 'aleatorio';
var ngeneraciones = 10;
var nmuestras = 10;
*/

//var debug = true;
var debug = false;

/*Inicio*/
var puntos = null;

function genetico_run(){
    //Generar los puntos
switch (tipo_grafo) {
    case 'circulo':
        puntos = circulo(nciudades,distancia_origen);
        break;
    case 'cuadrado':
        puntos = cuadrado(nciudades,distancia_origen);
        break;
    default:
        puntos = aleatorio(nciudades,distancia_origen);
        break;
}
if(debug)console.log(puntos);

var pob = poblacion(tam_pob,puntos);
if(debug)console.log(pob);

for(var i=0; i<ngeneraciones; i++){
    calcAptitudes(pob);
    if(debug)console.log(pob);
    pob.sort(function(a,b){
        return a.apt - b.apt;
    });
    if(debug)console.log(pob);
    var mejor = ind_mejor(pob);
    pob.mejor = pob[mejor];
    if(debug)console.log(pob.mejor);
    generaciones.push(pob);
    pob = cruza(pob,tipo_seleccion,porcentaje_elitismo);
    if(debug)console.log(pob);
    mutacion(pob);
    if(debug)console.log(pob);
}
calcAptitudes(pob);
pob.sort(function(a,b){
    return a.apt - b.apt;
});
var mejor = ind_mejor(pob);
pob.mejor = pob[mejor];
generaciones.push(pob);

if(debug)console.log(generaciones);

}

/*Definiciones*/
function mutacion(pob){
    var n = 1 + parseInt(Math.random() * 2);
    for(var i =0; i<n; i++){
        var ind = parseInt(Math.random() * pob.length);
        var a = parseInt(Math.random() * pob[ind].ruta.length);
        var b = parseInt(Math.random() * pob[ind].ruta.length);
        var t = pob[ind].ruta[a];
        pob[ind].ruta[a] = pob[ind].ruta[b];
        pob[ind].ruta[b] = t;
    }
}

function cruza(pob,tipo_seleccion,porcentaje_elitismo){
    var epob = pob.slice();
    epob = epob.slice(0,parseInt(pob.length * porcentaje_elitismo / 100));
    var npob = [epob[0],epob[1]];
    for(var i=0; i<parseInt(pob.length/2)-1; i++){
        var [a,b] = [null,null];
        switch (tipo_seleccion) {
            case 'aleatorio':
                [a,b] = [parseInt(epob.length * Math.random()),parseInt(epob.length * Math.random())]
                break;
            case 'ranking':
                [a,b] = torneo(epob)//ranking();
                break;
            case 'torneo':
                [a,b] = torneo(epob);
                break;
            default:
                break;
        }
        var fcruza = parseInt(Math.random() * epob[0].ruta.length);
        var h1 = [], h2 = [];
        for(var j=0; j<fcruza; j++){
            h1.push(epob[a].ruta[j]);
            h2.push(epob[b].ruta[j]);
        }
        for(var j=0; j<epob[b].ruta.length; j++){
            for(var k=fcruza; k<epob[a].ruta.length; k++){
                if(epob[a].ruta[k] == epob[b].ruta[j])
                    h1.push(epob[b].ruta[j])
            }
        }
        for(var j=0; j<epob[a].ruta.length; j++){
            for(var k=fcruza; k<epob[b].ruta.length; k++){
                if(epob[b].ruta[k] == epob[a].ruta[j])
                    h2.push(epob[a].ruta[j])
            }
        }
        npob.push({ruta:h1});npob.push({ruta:h2});
    }
    return npob;
}

function torneo(pob){
    var [a,b,c,d] = [parseInt(Math.random()*pob.length-1),parseInt(Math.random()*pob.length-1),parseInt(Math.random()*pob.length-1),parseInt(Math.random()*pob.length-1)];
    var [va,vb,vc,vd] = [pob[a].apt,pob[b].apt,pob[c].apt,pob[d].apt]
    var i1= null,i2=null;
    if(va>=vd) i1=a;
    else i1=d;
    if(vb>vc) i2=b;
    else  i2=c;
    return [i1,i2];
}

function ind_mejor(pob){
    var mejor = pob[0].apt;
    var ind = 0;
    for(var i=1; i<pob.length; i++){
        if(mejor > pob[i].apt) {
            ind = i;
            mejor =pob[i].apt;
        }
    }
    return ind;
}

function calcAptitudes(pob){
    for(var i=0; i<pob.length; i++){
        var dist = 0, j=0;
        for(j; j<pob[i].ruta.length-1; j++){
            var x1 = pob[i].ruta[j].x;
            var x2 = pob[i].ruta[j+1].x;
            var y1 = pob[i].ruta[j].y;
            var y2 = pob[i].ruta[j+1].y;
            dist += Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
        }
        var x1 = pob[i].ruta[j].x;
        var x2 = pob[i].ruta[0].x;
        var y1 = pob[i].ruta[j].y;
        var y2 = pob[i].ruta[0].y;
        dist += Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
        pob[i].apt = dist;
    }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function poblacion(tam,puntos){
    var pob = [];
    for(var i=0; i<tam; i++){
        var p = puntos.slice();
        shuffleArray(p);
        pob.push({ruta:p});
    }
    return pob;
}

function circulo(nciudades, radio, origen){
    var puntos = [];
    for(var i=0; i<nciudades; i++){
        var ang = Math.random() * 2 * Math.PI;
        var x = parseInt(radio * Math.cos(ang));
        var y = parseInt(radio * Math.sin(ang));
        if(origen != null){
            x+=origen.x;   
            y+=origen.y;   
        }
        puntos.push({id:i,x:x,y:y});
    }
    return puntos;
}

function cuadrado(nciudades, radio, origen){
    var puntos = [];
    for(var i=0; i<nciudades; i++){
        var ladoH = Math.random();
        var ladoV = Math.random();
        var x = parseInt(Math.random() * 2 * radio) - radio;
        var y = radio;
        if(ladoV >= 0.5)
            y = -y;
        if(ladoH >= 0.5)
            [x,y] = [y,x];
        if(origen != null){
            x += origen.x;
            y += origen.y;
        }
        puntos.push({id:i,x:x,y:y});
    }
    return puntos;
}

function aleatorio(nciudades, dist, origen){
    var puntos = [];
    for(var i=0; i<nciudades; i++){
        var x = parseInt(Math.random() * 2 * dist) - dist;
        var y = parseInt(Math.random() * 2 * dist) - dist;
        if(origen != null){
            x += origen.x;
            y += origen.y;
        }
        puntos.push({id:i,x:x,y:y});
    }
    return puntos;
}       

