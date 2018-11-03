/* Definicion de poblacion*/
var grafo = function(nciudades, dist, tipo, origen){
    this.nciudades = nciudades;
    this.dist = dist;
    this.origen = origen;
    this.tipo = tipo;
    var ciudades = null;
    if(tipo == 'circulo')
        ciudades = circulo(nciudades,dist, origen);
    else if(tipo=='cuadrado')
        ciudades = cuadrado(nciudades,dist, origen);
    else
        ciudades = aleatorio(nciudades,dist, origen);
    this.generacion = ciudades;
    this.ciudades = this.generacion.slice();
    shuffleArray(this.ciudades);
    
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

    this.setGeneracion = function(g){
        var c = [];
        for(var i=0; i<g.length; i++){
            c.push(this.generacion[g[i]]);
        }        
        this.ciudades = c;
    };
    
    /**Grafica con vis js */
    this.graficar = function(cont, options){
        var container = null;
        if(cont == null) container = document.createElement('div');
        else container = document.getElementById(cont);
        var nodes = [];
        var edges = [];
        var i = 0;
        for(i; i<this.ciudades.length-1; i++){
            var n = {id: this.ciudades[i].id,label: this.ciudades[i].id.toString(),x:this.ciudades[i].x*this.nciudades,y:this.ciudades[i].y*this.nciudades};
            nodes.push(n);
            edges.push({from:this.ciudades[i].id, to:this.ciudades[i+1].id});
        }
        var n = {id: this.ciudades[i].id,label: this.ciudades[i].id.toString(),x:this.ciudades[i].x*this.nciudades,y:this.ciudades[i].y*this.nciudades};
        nodes.push(n);
        //edges.push({from:nodes[nodes.length-1].id, to:nodes[0].id});
        var data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
          };
          if(options==null){
            options = {
              interaction:{
                dragNodes:false,
                hoverConnectedEdges:false,
              },
              physics:{
                enabled:false
              },
              nodes:{
                shape:'box',
                size:1
              }
            };
          }
          this.graph = new vis.Network(container, data, options);
          return container.innerHTML;       
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

var genetico = function(grafo, tampob){
    this.pob_init = poblacion(grafo.ciudades.length,tampob);
    this.grafo = grafo;
    this.solve = function(elitismo, seleccion,niteraciones){
        this.niteraciones = niteraciones;
        var pob = this.pob_init;
        this.iteraciones = [];
        var aptitudes = calcAptitud(pob,this.grafo);
        var mdist = Math.min(...aptitudes);
        var mruta = pob[aptitudes.indexOf(mdist)];
        this.iteraciones.push({poblacion:pob,aptitudes:aptitudes, mejor :{ruta:mruta,dist:mdist}});
        for(var i=0; i<niteraciones; i++){
            var aptitudes = calcAptitud(pob,grafo);
            pob = cruzas(pob,aptitudes,seleccion,elitismo);  
            pob = mutacion(pob); 
            aptitudes = calcAptitud(pob,grafo);
            var mdist = aptitudes[0];
            var mruta = pob[0];
            this.iteraciones.push({poblacion:pob,aptitudes:aptitudes, mejor:{ruta:mruta,dist:mdist}});
        }
    }

    function poblacion(nciudades, tampob){
        var pob = [];
        for(var i=0;i<tampob; i++){
            var p = [];
            for(var j=0;j<nciudades; j++)p.push(j);
            shuffleArray(p);
            pob.push(p);
        }
        return pob;
    }

    function calcAptitud(pob,grafo){
        var aptitudes = [];
        for(var i=0; i<pob.length; i++){
            var dist = 0;
            var individuo = pob[i];
            for(var j=0; j<individuo.length-1; j++){
                var x1 = grafo.ciudades[individuo[j]].x;
                var x2 = grafo.ciudades[individuo[j+1]].x;
                var y1 = grafo.ciudades[individuo[j]].y;
                var y2 = grafo.ciudades[individuo[j+1]].y;
                dist += Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
            }
            var x1 = grafo.ciudades[individuo[individuo.length-1]].x;
            var x2 = grafo.ciudades[individuo[0]].x;
            var y1 = grafo.ciudades[individuo[individuo.length-1]].y;
            var y2 = grafo.ciudades[individuo[0]].y;
            dist += Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
            aptitudes.push(dist);
        }
        return aptitudes;
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

    function ranking(gen){
        var t = 0;
        for(var  i=0; i<gen.length; i++){
            t+=gen[i].apt;
        }
        var rul = [];
        for(var  i=0; i<gen.length; i++){
            var r = t/gen[i].apt;
            rul.push(r);
        }
        var r1 = parseInt(Math.random() * Math.max(...rul));
        var r2 = parseInt(Math.random() * Math.max(...rul));
        var a=0,b=0;
        for(var i=0; i<rul; i++){
            if(r1 < rul[i]) a = i;
            if(r2 < rul[i]) b = i;
        }
        return [a,b];
    }

    function torneo(gen){
        var im = parseInt(Math.random() * (gen.length-1));
        var pm = gen[im].apt; 
        var ps = null, is = null;
        for(var i=0; i<gen.length/2; i++){
            is = parseInt(Math.random() * gen.length-1);
            ps = gen[is].apt; 
            if(pm > ps) {pm = ps; im = is;}
        }
        return [im,is];
    }

    function cruzas(pob,aptitudes,seleccion,elitismo){
        var resp = [];
        var pob_elite = obtiene_elite(pob,aptitudes,elitismo);
        //console.log(pob_elite);
        resp.push(pob_elite[0].pob);
        resp.push(pob_elite[1].pob);
        for(var i=0; i< parseInt(pob.length/2) -1 ; i++){
            var [a,b] = [null,null];
            switch (seleccion) {
                case 'ranking': 
                    [a,b] = ranking(pob_elite);                   
                    break;
                case 'torneo':
                    [a,b] = torneo(pob_elite)                    
                    break;
                default:
                    [a,b] = [parseInt(Math.random() * pob_elite.length),parseInt(Math.random() * pob_elite.length)];
                break;
            }
            var r = parseInt(Math.random() * (pob_elite[0].pob.length-1));
            var na = pob_elite[a].pob.slice(0,r);
            for(var j=0; j<pob_elite[b].pob.length; j++){
                for(var k=r; k<pob_elite[a].pob.length; k++){
                    if(pob_elite[b].pob[j] == pob_elite[a].pob[k])
                        na.push(pob_elite[b].pob[j]);
                }           
            }
            var nb = pob_elite[b].pob.slice(0,r);
            for(var j=0; j<pob_elite[a].pob.length; j++){
                for(var k=r; k<pob_elite[b].pob.length; k++){
                    if(pob_elite[a].pob[j] == pob_elite[b].pob[k])
                        nb.push(pob_elite[a].pob[j]);
                }           
            }
            resp.push(na);
            resp.push(nb);
        }
        return resp;
    }

    function obtiene_elite(pob,arr,elite){
        const l = arr.length;
        let j, temp;
        for ( let i = 1; i < l; i++ ) {
            j = i;
            temp = arr[ i ];
            temp2 = pob[ i ];
            while ( j > 0 && arr[ j - 1 ] > temp ) {
            arr[ j ] = arr[ j - 1 ];
            pob[ j ] = pob[ j - 1 ];
            j--;
            }
            arr[ j ] = temp;
            pob[ j ] = temp2;
        }
        var e = [];
        for ( let i = 1; i < parseInt(elite * l / 100); i++ ) {
            e.push({pob:pob[i], apt:arr[i]})
        }
        return e;
    }
}

