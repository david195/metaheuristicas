/*algoritmo genetico con ruleta*/

//Definiciones
function poblacion(tampob, numbit){
    var pob = [];
    for(var i=0; i<tampob; i++){
        var ar = [];
        for(var j=0; j<numbit; j++){
            var r = Math.random();
            if(r>=0.5)
                ar.push(1);
            else
                ar.push(0);
        }
        pob.push(ar);
    }
    return pob;
}

function aptitud(x){
    return 12*Math.pow(x,5) - 975*Math.pow(x,4) + 28000*Math.pow(x,3) - 345000*Math.pow(x,2) + 1800000*x;    
}

function bin2dec(ar){
    var x = 0;
    for(var i=0; i<ar.length;i++){
        x += Math.pow(2,4-i) * ar[i];        
    }
    return x;
}

function calcAptitud(pob){
    var r = [];
    for(var i=0; i<pob.length; i++){
        r.push(aptitud(bin2dec(pob[i])));
    }
    return r;
}   

function cumSum(apts){
    var suma = 0;
    for(var i=0;i<apts.length;i++){
        suma += apts[i];
    }
    return suma;
}

function ruleta(aptitudes,total){
    var rul = [];
    for(var i=0; i<aptitudes.length; i++){
        rul.push(aptitudes[i]/total);
        if(i>0)
            rul[i] += rul[i-1];
    }
    return rul;
}

function indice(rul){
    var r = Math.random();
    for(var i=0; i<rul.length; i++){
        if(r<=rul[i])
            return i;
    }
}

function cruzas(pob, rul){
    var resp = [];
    for(var i=0; i< parseInt(pob.length/2); i++){
        var a = indice(rul);
        var b = indice(rul);
        while (a == b)
            b = indice(rul);
        var r = Math.random() * pob[0].length;
        var aa = pob[a].slice(0,r).concat(pob[b].slice(r,pob[a].length));
        var bb = pob[b].slice(0,r).concat(pob[a].slice(r,pob[a].length));
        resp.push(aa);
        resp.push(bb);
    }
    return resp;
}

function mutacion(pob){
    var i = parseInt((pob.length-1) * Math.random());
    var n = parseInt((pob[i].length-1) * Math.random());
    var m = parseInt((pob[i].length-1) * Math.random());
    var temp = pob[i][n];
    pob[i][n] = pob[i][m];
    pob[i][m] = temp;
    return pob;
}

//programa
var genetico = {iteraciones:[]};
var niteraciones = 10;
var tampob=10, numbit=5;
var pob = poblacion(tampob,numbit);
for(var i=0; i<niteraciones; i++){
    var aptitudes = calcAptitud(pob);
    var total = cumSum(aptitudes);
    var rul = ruleta(aptitudes,total);
    pob = cruzas(pob,rul);  
    pob = mutacion(pob);  
    genetico.iteraciones.push({poblacion:pob,aptitudes:aptitudes});
}

for(var i=0; i<niteraciones; i++){
    console.log('Mejor aproximacion: ', Math.max(...genetico.iteraciones[i].aptitudes));
}
//console.log(genetico.iteraciones[niteraciones-1]);
//console.log('Mejor aproximacion: ', Math.max(...genetico.iteraciones[niteraciones-1].aptitudes));