$(document).ready(function() {
    /* Operaciones antes de abrir el modal de nueva cotización */
    $('#btn_cotizacion').click(function () {
        $('#selCli02').val(null).trigger('change');
    });
    $('#btn_repuesto').click(function () {
        $('#selRep02').val(null).trigger('change');
    });
    /* Operaciones para Select2 JS */
    $('.select2-clientes').select2({
        placeholder: 'Seleccione un cliente',
        allowClear: true,
        language: {
            noResults: function (params) {
                return "Sin resultados.";
            }
        },
        closeOnSelect: true
    }).on('change', function () {
        
    });
    $('.select2-repuestos').select2({
        placeholder: 'Seleccione un repuesto',
        allowClear: true,
        language: {
            noResults: function (params) {
                return "Sin resultados.";
            }
        },
        closeOnSelect: true
    });
});

new Vue({
    el: '#cotizacion',
    created: function(){
        this.getKeeps();
        this.getClientes();
        this.getRepuestos();
        this.getEstados();
        this.getVehiculos();
    },
    data: {
        errors: [],
        pagination: {
            'total'         : 0,
            'current_page'  : 0,
            'per_page'      : 0,
            'last_page'     : 0,
            'from'          : 0,
            'to'            : 0
        },
        offSet: 2,
        clientes: [], repuestos: [], estados: [], vehiculos: [],
        /* -----------------------------------------------
        ** Objetos para la tabla maestra
        ** ----------------------------------------------- */
        keeps: [],
        dtlKeeps: [],
        newKeepTitulo: '', newKeepCliente: '', newKeepVehiculo: '', newKeepDescripcion: '', newKeepEstado: '', newKeepPrecio: '',
        dtlKeepRepuesto: '', dtlKeepCantidad: '',
        fillKeep: {'id': '', 'titulo': '', 'cliente': '', 'vehiculo': '', 'descripcion': '', 'estado': '', 'precio': ''},
        lookKeep: {'id': '', 'titulo': '', 'user': '', 'nomuser': '', 'cliente': '', 'nomcliente': '', 'vehiculo': '', 
                   'nomvehiculo': '', 'fecha': '', 'estado': '', 'nomestado': '', 'precio': '', 'descripcion': ''},
    },
    computed: {
        isActived: function () {
            return this.pagination.current_page;
        },
        pagesNumber: function () {
            if (!this.pagination.to) {
                return [];
            }
            var from = this.pagination.current_page - this.offSet; // TODO offSet
            if (from < 1) { from = 1; }
            var to = from + (this.offSet*2); // TODO
            if (to >= this.pagination.last_page) {
                to = this.pagination.last_page;
            }
            var pagesArray = [];
            while (from <= to) {
                pagesArray.push(from);
                from++;
            }
            return pagesArray;
        }
    },
    methods: {
        changePage: function (page) {
            this.pagination.current_page = page;
            this.getKeeps(page);
        },
        generalValidation: function (keep) {
            switch (keep.estado) {
                case 1: // No pagado
                    
                    break;
                case 2: // Pagado
                    toastr.info('La cotización se encuentra pagada y no puede modificarse');
                    return false;
                    break;
                case 3: // Cancelado
                    toastr.warning('La cotización se encuentra cancelada y no puede modificarse');
                    return false;
            }
            return true;
        },
        getEstado: function (estado) {
            switch (parseInt(estado)) {
                case 1: // No pagado
                    $('#btn_repuesto').removeClass('disabled');
                    $('.btn_eliminar').show();
                    break;
                case 2: // Pagado
                    $('#btn_repuesto').addClass('disabled');
                    $('.btn_eliminar').hide();
                    break;
                case 3: // Cancelado
                    $('#btn_repuesto').addClass('disabled');
                    $('.btn_eliminar').hide();
                    break;
            }
        },
        getClientes: function () {
            var urlKeeps ='listcliente';
            axios.get(urlKeeps).then(response => {
                this.clientes = response.data
            });
        },
        getRepuestos: function () {
            var urlKeeps ='listrepuesto';
            axios.get(urlKeeps).then(response => {
                this.repuestos = response.data
            });
        },
        getEstados: function () {
            var urlKeeps ='catalogoconfig/COTESTADO';
            axios.get(urlKeeps).then(response => {
                this.estados = response.data
            });
        },
        getVehiculos: function () {
            if(this.newKeepCliente > 0){
                var urlKeeps ='listvehiculo/'+this.newKeepCliente;
                axios.get(urlKeeps).then(response => {
                    this.vehiculos = response.data
                });
            }
        },
        /* -----------------------------------------------
        ** Metodos para la tabla maestra
        ** ----------------------------------------------- */
        getKeeps: function(page){
            var urlKeeps ='cotizacion?page='+page;
            axios.get(urlKeeps).then(response => {
                this.keeps = response.data.cotizaciones.data
                this.pagination = response.data.pagination
            });
        },
        createKeep: function(){
            var urlKeep ='cotizacion';
            axios.post(urlKeep, {
                titulo: this.newKeepTitulo,
                cliente: this.newKeepCliente, //$('#selCli02').select2('val'),
                vehiculo: this.newKeepVehiculo,
                descripcion: this.newKeepDescripcion,
                estado: 1, //this.newKeepEstado
                precio: 0.00 //this.newKeepPrecio,
            }).then(response =>{
                this.getKeeps();
                this.newKeepTitulo ='';
                this.newKeepCliente = '';
                this.newKeepVehiculo = '';
                this.newKeepDescripcion = '';
                this.newKeepEstado = '';
                this.newKeepPrecio = '';
                this.errors = [];
                $('#createMaster').modal('hide');
                toastr.success('Proyecto agregado con exito');
            }).catch(error => {
                this.errors = error.response.data
            });
        },
        editKeep: function (keep) {
            if (this.generalValidation(keep)) {
                this.fillKeep.id          = keep.id;
                this.fillKeep.titulo      = keep.titulo;
                this.fillKeep.cliente     = keep.cliente;
                this.fillKeep.nomcliente  = keep.nomcliente;
                this.fillKeep.vehiculo    = keep.vehiculo;
                this.fillKeep.nomvehiculo = keep.nomvehiculo;
                this.fillKeep.descripcion = keep.descripcion;
                this.fillKeep.estado      = keep.estado;
                this.fillKeep.precio      = keep.precio;
                $("#estado01").val(keep.estado);
                $('#updateMaster').modal('show');
            }
        },
        updateKeep: function(id){
            this.fillKeep.estado = $("#estado01").val();
            var urlKeep = 'cotizacion/'+id;
            var flag    = 1;
            if (this.fillKeep.estado == 2) {
                if (this.fillKeep.precio == 0.00) {
                    toastr.error('No se puede pagar una cotización con $0.00 como valor total');
                    flag = 0;
                };
            }
            if (flag == 1) {
                axios.put(urlKeep,this.fillKeep).then(response => {
                    this.getKeeps(this.pagination.current_page);
                    this.getEstado(this.fillKeep.estado);
                    this.lookKeep.nomestado    = $('#estado01 option:selected').text();
                    $('#updateMaster').modal('hide');
                    toastr.success('Cotización actualizada con exito');
                    if (this.fillKeep.estado == 2) {
                        toastr.info('Se ha generado un proyecto a partir de esta cotización');
                    }
                    this.fillKeep = {'id': '', 'titulo': '', 'cliente': '', 'vehiculo': '', 'descripcion': '', 'estado': '', 'precio': ''};
                    this.errors = [];
                }).catch(error => {
                    this.errors = error.response.data
                });
            }
        },
        getKeepsGnr: function(keep){

            this.getDtlKeeps(keep.id);
            
            this.lookKeep.id           = keep.id;
            this.lookKeep.titulo       = keep.titulo;
            this.lookKeep.user         = keep.user;
            this.lookKeep.nomuser      = keep.nomuser;
            this.lookKeep.cliente      = keep.cliente;
            this.lookKeep.nomcliente   = keep.nomcliente;
            this.lookKeep.vehiculo     = keep.vehiculo;
            this.lookKeep.nomvehiculo  = keep.nomvehiculo;
            this.lookKeep.fecha        = keep.created_at;
            this.lookKeep.nomestado    = keep.nomestado;
            this.lookKeep.precio       = '$'+keep.precio;
            this.lookKeep.descripcion  = keep.descripcion;
            this.lookKeep.estado       = keep.estado;

            this.getEstado(keep.estado);
            $('#detalleCotizacion').removeClass('hidden');
            $('#detalleRepuestos').removeClass('hidden');
        },
        /* -----------------------------------------------
        ** Metodos para la tabla detalle
        ** -----------------------------------------------*/
        getDtlKeeps: function (id) {
            var urlKeeps ='dtlcotizacion/'+id;
            axios.get(urlKeeps).then(response => {
                this.dtlKeeps = response.data.dtlProyectos.data
                //this.pagination = response.data.pagination
            });
        },
        dtlCreateKeep: function () {
            var urlKeep ='dtlcotizacion';
            axios.post(urlKeep, {
                cotizacion: this.lookKeep.id,
                repuesto: this.dtlKeepRepuesto, //$('#selRep02').select2('val'),
                cantidad: this.dtlKeepCantidad
            }).then(response =>{
                this.getKeeps(this.pagination.current_page);
                this.getDtlKeeps(this.lookKeep.id);
                this.getSum(this.lookKeep.id);
                this.dtlKeepCantidad = '';
                this.errors = [];
                $('#createDetail').modal('hide');
                $('#selRep02').val(null).trigger('change');
                toastr.success('Repuesto agregado con exito');
            });
        },
        deleteDtlKeep: function (dtlKeep) {
            var urlKeep = 'dtlcotizacion/'+dtlKeep.id;
            if (this.lookKeep.estado == 1) {
                axios.delete(urlKeep).then(response => {
                    this.getKeeps(this.pagination.current_page);
                    this.getDtlKeeps(this.lookKeep.id);
                    this.getSum(this.lookKeep.id);
                    toastr.success('Repuesto eliminado correctamente.');
                });
            } else {
                toastr.error('Imposible eliminar repuesto.');
            }
        },
        getSum: function (id) {
            var urlKeeps ='dtlcotizacionsuma/'+id;
            axios.get(urlKeeps).then(response => {
                this.lookKeep.precio = '$'+response.data;
            });
        }
    }
});