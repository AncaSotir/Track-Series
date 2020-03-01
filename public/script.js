
var app;

window.addEventListener( 'load' , function() {

  Vue.prototype.axios = axios;

  app = new Vue( {

    el: '#vue',

    data:  {
          prieteni: [],
          input_prieteni: { nume: ""},
          contor_prieteni: -1,

          seriale: [],
          input_seriale: { titlu: "", nsez: "", nep: "" },
          contor_seriale: -1,

          tracker: [],
        },

    created: function(){
      this.axios.get( '/api/tracker_prieteni' )
        .then( (_response) => {
          let obj = _response.data.data;
          for(let p in obj){
            let aux = Object.assign( {}, obj[p] );
            aux.id = p;
            this.prieteni.push(aux);
          }

          var select_prieten = document.getElementById("select_prieten");
          if(select_prieten){
            for(let el=0; el<this.prieteni.length; el++) {
              var new_node = document.createElement("option");
              new_node.innerHTML = this.prieteni[el].nume;
              new_node.value = this.prieteni[el].nume;
              select_prieten.appendChild(new_node);
            }
          }
        } );
      this.axios.get( '/api/tracker_seriale' )
        .then( (_response) => {
          let obj = _response.data.data;
          for(let p in obj){
            let aux = Object.assign( {}, obj[p] );
            aux.id = p;
            this.seriale.push(aux);
          }

          var page = document.getElementById("shows_mode");
          var select_serial = document.getElementById("select_serial");
          if(page) {
            for(let el=0; el<this.seriale.length; el++) {
            var new_node = document.createElement("div");
            var poster = document.createElement("img");
            var overlay = document.createElement("div");
            var overlay_text = document.createElement("div");
            var banda_titlu = document.createElement("div");
            var titlu = document.createElement("p");
            poster.src = this.seriale[el].src;
            poster.alt = this.seriale[el].titlu;
            titlu.innerHTML = this.seriale[el].titlu;
            let nrep=0;
            for(let i=0; i<this.seriale[el].nep.length; ++i)
              nrep+=this.seriale[el].nep[i];
            overlay_text.innerHTML = this.seriale[el].titlu + "<hr>" + this.seriale[el].nsez + " sezoane<br>" + nrep + " episoade<hr>";
            if(this.seriale[el].finished==true)
              overlay_text.innerHTML += "Incheiat";
            else
              overlay_text.innerHTML += "In derulare";
            overlay_text.innerHTML += "<hr><a href=\"" + this.seriale[el].link +"\">Vezi IMDb</a>";
            new_node.classList.add("polaroid");
            banda_titlu.classList.add("banda");
            poster.classList.add("imagine");
            overlay.classList.add("overlay");
            overlay_text.classList.add("text");
            banda_titlu.appendChild(titlu);
            overlay.appendChild(overlay_text);
            new_node.appendChild(poster);
            new_node.appendChild(overlay);
            new_node.appendChild(banda_titlu);
            page.appendChild(new_node);
          }
          }
          if(select_serial) {
            for(let el=0; el<this.seriale.length; el++) {
              var new_node = document.createElement("option");
              new_node.innerHTML = this.seriale[el].titlu;
              new_node.value = this.seriale[el].titlu;
              select_serial.appendChild(new_node);
            }
          }
        } );
      this.axios.get( '/api/tracker' )
        .then( (_response) => {
          let obj = _response.data.data;
          for(let p in obj){
            let aux = Object.assign( {}, obj[p] );
            aux.id = p;
            this.tracker.push(aux);
          }
        } );
    },

    methods: {
      add_prieten: function() {
        var buton = document.getElementById("commit");
        if(this.contor_prieteni == -1) {  //add
          let oo = Object.assign( {} , this.input_prieteni );
          for(var i=0; i<this.prieteni.length; ++i)
            if(oo.nume==this.prieteni[i].nume) {
              alert("Acest prieten a fost deja adaugat!");
              return;
            }
          axios.post( '/api/tracker_prieteni' , oo )
          .then( _response => {
            if ( _response.data.ret === "OK" ) {
              let aux = Object.assign( {}, oo );
              aux.id =_response.data.id ;
              this.prieteni.push(aux);
              this.input_prieteni.nume="";
            }
          } );
        }
        else { //edit
          let oo = Object.assign( {} , this.input_prieteni );
          for(var i=0; i<this.prieteni.length; ++i)
            if(oo.nume==this.prieteni[i].nume && oo.id!=this.prieteni[i].id) {
              alert("Acest prieten a fost deja adaugat!");
              return;
            }
          for(let contor in this.input_prieteni)
          {
            this.prieteni[this.contor_prieteni][contor]=this.input_prieteni[contor];
          }
          let aux = {};
          aux.nume = this.prieteni[this.contor_prieteni].nume;
          axios.put( `/api/tracker_prieteni/${this.prieteni[this.contor_prieteni].id}` , aux );
          this.contor_prieteni = -1;
          this.input_prieteni.nume="";
          buton.innerHTML = "Adauga";
        }
      },
      delete_prieten: function(index) {
        var sure=confirm("Sunteti sigur ca vreti sa stergeti acest prieten?");
        if(sure)
          this.axios.delete( `/api/tracker_prieteni/${this.prieteni[index].id}` )
          .then( () => {
            this.prieteni.splice(index, 1);
          } );
      },
      edit_prieten: function(index) {
        var buton = document.getElementById("commit");
        buton.innerHTML = "Modifica";
        let io = Object.assign( {} , this.prieteni[index] );
        this.input_prieteni = io;
        this.contor_prieteni=index;
      },

      add_serial: function() {
        var buton = document.getElementById("commit");
        if(this.contor_seriale == -1) { //add
          let oo = Object.assign( {} , this.input_seriale );
          for(var i=0; i<this.seriale.length; ++i)
            if(oo.titlu==this.seriale[i].titlu) {
              alert("Acest serial a fost deja adaugat!");
              return;
            }
          if(oo.nsez<=0){
            alert("Numarul sezoanelor introdus este invalid!");
            return;
          }
          oo.nep=this.input_seriale.nep.split(" ");
          if(oo.nep.length!=oo.nsez){
            alert("Numarul sezoanelor si lista episoadelor nu sunt compatibile!");
            return;
          }
          for(let i=0; i<oo.nep.length; ++i){
            if(oo.nep[i]<=0 || isNaN(oo.nep[i])){
              alert("Lista episoadelor nu este valida!");
              return;
            }
          }
          axios.post( '/api/tracker_seriale' , oo )
          .then( _response => {
            if ( _response.data.ret === "OK" ) {
              let aux = Object.assign( {}, oo );
              aux.id =_response.data.id ;
              this.seriale.push(aux);
              this.input_seriale.titlu=this.input_seriale.nsez=this.input_seriale.nep="";
            }
          } );

        }
        else { //edit
          let oo = Object.assign( {} , this.input_seriale );
          for(var i=0; i<this.seriale.length; ++i){
            if(oo.titlu==this.seriale[i].titlu && i!=this.contor_seriale) {
              alert("Acest serial a fost deja adaugat!");
              return;
            }
          }
        if(oo.nsez<=0){
          alert("Numarul sezoanelor introdus este invalid!");
          return;
        }
        oo.nep=this.input_seriale.nep.split(" ");
        if(oo.nep.length!=oo.nsez){
          alert("Numarul sezoanelor si lista episoadelor nu sunt compatibile!");
          return;
        }
        for(let i=0; i<oo.nep.length; ++i){
          if(oo.nep[i]<=0 || isNaN(oo.nep[i])){
            alert("Lista episoadelor nu este valida!");
            return;
          }
        }
        for(let contor in this.input_seriale)
        {
          this.seriale[this.contor_seriale][contor]=this.input_seriale[contor];
        }
        axios.put( `/api/tracker_seriale/${this.seriale[this.contor_seriale].id}` , oo );
        this.contor_seriale = -1;
        for(let p in this.input_seriale){
          this.input_seriale[p]="";
        buton.innerHTML = "Adauga";
        }
    }
      },
      delete_serial: function(index) {
        let sure = confirm("Sunteti sigur ca vreti sa stergeti acest serial?");
        if(sure)
        this.axios.delete( `/api/tracker_seriale/${this.seriale[index].id}` )
        .then( () => {
          this.seriale.splice(index, 1);
        } );
      },
      edit_serial: function(index) {
        var buton = document.getElementById("commit");
        buton.innerHTML = "Modifica";
        this.contor_seriale=index;
  			for(let contor in this.input_seriale)
  			{
          if(contor=="nep")
            this.input_seriale[contor]=this.seriale[index][contor].join(" ");
          else
					  this.input_seriale[contor]=this.seriale[index][contor];
				}
      },
      toggle_edit: function() {
        var buton = document.querySelector("div.content button");
        var edit = document.getElementById("edit_mode");
        var shows = document.getElementById("shows_mode");
        if(buton.innerHTML=="Turn OFF edit mode") {
          edit.style.display = "none";
          shows.style.display = "flex";
          buton.innerHTML="Turn ON edit mode";
        }
        else {
          edit.style.display = "block";
          shows.style.display = "none";
          buton.innerHTML="Turn OFF edit mode";
        }
      },

      add_tracker: function() {
        this.resetTracker();
        var prieten_sel = document.getElementById("select_prieten").value;
        if(prieten_sel=="Selecteaza un prieten") {
          alert("Nu ati selectat niciun prieten!");
          return;
        }
        var serial_sel = document.getElementById("select_serial").value;
        if(serial_sel=="Selecteaza un serial") {
          alert("Nu ati selectat niciun serial!");
          return;
        }
        for(var i=0; i<this.tracker.length; ++i)
          if(this.tracker[i].nume==prieten_sel && this.tracker[i].titlu==serial_sel) {
            alert("Prietenul selectat urmareste deja acest serial!");
            return;
          }
        let obj={};
        obj.nume=prieten_sel;
        obj.titlu=serial_sel;
        obj.sez=1;
        obj.ep=1;
        axios.post( '/api/tracker' , obj )
        .then( _response => {
          if ( _response.data.ret === "OK" ) {
            let aux = Object.assign( {}, obj );
            aux.id =_response.data.id ;
            this.tracker.push(aux);
          }
        } );
      },
      delete_tracker: function(index) {
        let sure = confirm("Sunteti sigur ca vreti sa stergeti acest tracker?");
        if(sure) {
          this.axios.delete( `/api/tracker/${this.tracker[index].id}` )
          .then( () => {
            this.tracker.splice(index, 1);
          } );
        }
      },
      minus_sez: function(index) {
        this.tracker[index].ep=1;
        if(this.tracker[index].sez == 1)
          this.tracker[index].sez=1;
        else
          this.tracker[index].sez-=1;
        let obj = {};
        obj.nume = this.tracker[index].nume;
        obj.titlu = this.tracker[index].titlu;
        obj.sez = this.tracker[index].sez;
        obj.ep = this.tracker[index].ep;
        axios.put( `/api/tracker/${this.tracker[index].id}` , obj );
      },
      plus_sez: function(index) {
        let maxsez,maxep;
        for(var sez=0; sez<this.seriale.length; ++sez)
        {
          if(this.seriale[sez].titlu==this.tracker[index].titlu) {
            maxsez=this.seriale[sez].nsez;
            maxep=this.seriale[sez].nep[maxsez-1];
            break;
          }
        }
        if(this.tracker[index].sez==maxsez) {
          this.tracker[index].ep=maxep;
        }
        else{
          this.tracker[index].ep=1;
          this.tracker[index].sez+=1;
        }
        let obj = {};
        obj.nume = this.tracker[index].nume;
        obj.titlu = this.tracker[index].titlu;
        obj.sez = this.tracker[index].sez;
        obj.ep = this.tracker[index].ep;
        axios.put( `/api/tracker/${this.tracker[index].id}` , obj );
      },
      plus_ep: function(index, value) {
        let sez_curent=this.tracker[index].sez;
        let ep_curent=this.tracker[index].ep;
        let nr_sez;
        let nep_sez_curent;
        for(var sez=0; sez<this.seriale.length; ++sez) {
          if(this.seriale[sez].titlu==this.tracker[index].titlu) {
            nr_sez=this.seriale[sez].nsez;
            nep_sez_curent=this.seriale[sez].nep[sez_curent-1];
            break;
          }
        }
        if(ep_curent+value<=nep_sez_curent){
          this.tracker[index].ep+=value;
          let obj = {};
          obj.nume = this.tracker[index].nume;
          obj.titlu = this.tracker[index].titlu;
          obj.sez = this.tracker[index].sez;
          obj.ep = this.tracker[index].ep;
          axios.put( `/api/tracker/${this.tracker[index].id}` , obj );
          return;
        }
        if(sez_curent==nr_sez) {
          this.tracker[index].ep=nep_sez_curent;
          let obj = {};
          obj.nume = this.tracker[index].nume;
          obj.titlu = this.tracker[index].titlu;
          obj.sez = this.tracker[index].sez;
          obj.ep = this.tracker[index].ep;
          axios.put( `/api/tracker/${this.tracker[index].id}` , obj );
          return;
        }
        //sez_curent<nr_sez
        this.tracker[index].sez++;
        this.tracker[index].ep=1;
        let ep_adaugate=nep_sez_curent-ep_curent+1;
        this.plus_ep(index, value-ep_adaugate);

      },
      minus_ep: function(index, value) {
        let sez_curent=this.tracker[index].sez;
        let ep_curent=this.tracker[index].ep;
        let nep_sez_anterior;
        if(sez_curent>1){
          for(var sez=0; sez<this.seriale.length; ++sez) {
            if(this.seriale[sez].titlu==this.tracker[index].titlu) {
              nep_sez_anterior=this.seriale[sez].nep[sez_curent-2];
              break;
            }
          }
        }
        if(ep_curent-value>=1){
          this.tracker[index].ep-=value;
          let obj = {};
          obj.nume = this.tracker[index].nume;
          obj.titlu = this.tracker[index].titlu;
          obj.sez = this.tracker[index].sez;
          obj.ep = this.tracker[index].ep;
          axios.put( `/api/tracker/${this.tracker[index].id}` , obj );
          return;
        }
        if(sez_curent==1) {
          this.tracker[index].ep=1;
          let obj = {};
          obj.nume = this.tracker[index].nume;
          obj.titlu = this.tracker[index].titlu;
          obj.sez = this.tracker[index].sez;
          obj.ep = this.tracker[index].ep;
          axios.put( `/api/tracker/${this.tracker[index].id}` , obj );
          return;
        }
        //sez_curent>1
        this.tracker[index].sez--;
        this.tracker[index].ep=nep_sez_anterior;
        let ep_scazute=ep_curent;
        this.minus_ep(index, value-ep_scazute);
      },
      resetTracker: function() {
        var tabel_track = document.getElementById("tabel");
        var rows = tabel_track.children;
        for(var i=0; i<rows.length; ++i)
          rows[i].style.display="table-row";
      },
      searchByPrieten: function() {
        var prieten_sel = document.getElementById("select_prieten").value;
        if(prieten_sel=="Selecteaza un prieten") {
          alert("Nu ati selectat niciun prieten!");
          return;
        }
        this.resetTracker();
        var tabel_track = document.getElementById("tabel");
        var rows = tabel_track.children;
        let found=false;
        for(var i=0; i<rows.length; ++i) {
          if(rows[i].firstChild.innerHTML!=prieten_sel)
            rows[i].style.display="none";
          else found=true;
        }
        if(!found){
          alert("Prietenul selectat nu urmareste niciun serial!");
          this.resetTracker();
        }
      },
      searchBySerial: function() {
        var serial_sel = document.getElementById("select_serial").value;
        if(serial_sel=="Selecteaza un serial") {
          alert("Nu ati selectat niciun serial!");
          return;
        }
        this.resetTracker();
        var tabel_track = document.getElementById("tabel");
        var rows = tabel_track.children;
        let found=false;
        for(var i=0; i<rows.length; ++i) {
          if(rows[i].firstChild.nextElementSibling.innerHTML!=serial_sel)
            rows[i].style.display="none";
          else found=true;
        }
        if(!found){
          alert("Serialul selectat nu este urmarit de niciun prieten!");
          this.resetTracker();
        }
      }
    },

    filters: {
      number: function( _in ) {
        return Number(_in).toFixed(2)
      }
    }

  } );
} );
