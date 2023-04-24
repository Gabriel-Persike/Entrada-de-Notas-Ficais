$(document).ready(function() {
	
	console.clear();
	$('.statusFaturado').hide();
	
	var atividade = $('#atividade').val();
	var total = $("#valorTotal").val();
	
	if (total != null && total != '') {
		$('#labelTotal').html(total);
	}
	
	if ($('#resultadoMsg').val() != '' && FORM_MODE == 'VIEW') {
    	
		console.log($('#resultadoMsg').val());

    	$('#msgRetorno').html('');
		$('#msgRetorno').html($('#resultadoMsg').val());
		$('.statusFaturado').show();
    }
		
	if (atividade == '') {
		
		var dataTable = listaMovimento();		
		
	    var table = $('#faturamento').DataTable( {
	    	"data": dataTable,
	        "columns": [
	        	{
	        		"className": 'select-checkbox',
	        		"orderable": false,
	        		"data":           null,
	                "defaultContent": '',
	        		"targets":   0
	        	},
	            {
	                "className":      'details-control',
	                "orderable":      false,
	                "data":           null,
	                "defaultContent": '',
	                "targets":   1
	            }, 
	            { "className": 'oculta', "data": "CODCOL" },
	            { "className": 'oculta', "data": "IDMOV" },
	            { "data": "FORNECEDOR" },
	            { "data": "CPF_CNPJ" },            
	            { "data": "NUMEROMOV" },
	            { "data": "LOCALESTOQUE" },
	            { "data": "DATAEMISSAO" },
	            { "className": 'direita', "data": "VALORTOTAL" },
	            { "className": 'direita', "data": "VALORORIGINAL" },// 10
	            { "className": 'oculta', "data": "COD_PGTO" },      // 11
	            { "className": 'oculta', "data": "NOME_PGTO" },     // 12 
	            { "className": 'oculta', "data": "COD_FORN" },      // 13
	            { "className": 'oculta', "data": "COD_FORPGTO" },   // 14
	            { "className": 'oculta', "data": "NOME_FORPGTO" },  // 15
	            { "className": 'oculta', "data": "FILIAL" },   		// 16
	            { "className": 'oculta', "data": "COD_COL_FORN" }	// 17
	        ],        
	        "select": {
	            style: 'multi',
	            selector: 'td:first-child'
	        },
	        "language": {
	            "url": "pt-br.lang",
	            "select": {
	                rows: {
	                    _: "%d linhas selecionadas",
	                    0: "Clique na linha para selecionar",
	                    1: "1 linha selecionada"
	                }
	            }
	        }
	    } );
	    
	    // Mostra linha de detalhes e altera o botão de exibição
	    $('#faturamento tbody').on('click', 'td.details-control', function () {
	        var tr = $(this).closest('tr');
	        var row = table.row(tr);
	        var values = row.data();
	        var codcol = values.CODCOL;
	        var idmov = values.IDMOV;   
	        var solicitante = values.SOLICITANTE; 
	        var comprador = values.COMPRADOR; 
	        var aprovador = values.APROVADOR;
	        var url = values.FLUIG; 
	        
	        if ( row.child.isShown() ) {           
	            row.child.hide();
	            tr.removeClass('shown');
	        }
	        else {            
	            row.child(showDetails(codcol, idmov, solicitante, comprador, aprovador, url)).show();
	            tr.addClass('shown');
	        }
	    } );
	        
	    // Envia os movimentos para a próxima etapa
	    $('#button-prosseguir').click( function () {
	        var erro = null;
	    	var arrMovs = '';
	    	var valorTotal = 0;
	    	var quantidade = $("#faturamento").find('.selected');
	        for (x = 0; x < quantidade.length; x++) {
	        	
	        	if (x == 0) {
	        		var coligadaUnica = quantidade[x].cells[2].innerText;
	        		var cnpjUnico = quantidade[x].cells[5].innerText;
	        	}
	        	var codcol = quantidade[x].cells[2].innerText;
	        	var cnpj = quantidade[x].cells[5].innerText;
	        	
	        	if (coligadaUnica != codcol) {
	        		$('#mensagemErro').val("Não é possível faturar movimentos de COLIGADAS distintas! Por favor, selecione novamente.");
	        		break;
	        	}
	        	else if (cnpjUnico != cnpj) {
	        		$('#mensagemErro').val("Não é possível faturar movimentos de FORNECEDORES distintos! Por favor, selecione novamente.");
	        		break;
	        	}
	        	else {
	        		$('#mensagemErro').val('OK');
	        		var idmov = quantidade[x].cells[3].innerText;
	        		var valor = quantidade[x].cells[9].innerText;
	        	
	        		var coligadaUnica = quantidade[x].cells[2].innerText;
	        		var cnpjUnico = quantidade[x].cells[5].innerText;
	        		var fornecedor = quantidade[x].cells[4].innerText;
	        		var codPgto = quantidade[x].cells[11].innerText;
	        		var nomePgto = quantidade[x].cells[12].innerText;
	        		var codForn = quantidade[x].cells[13].innerText;
	        		var codFormPgto = quantidade[x].cells[14].innerText;
	        		var nomeFormPgto = quantidade[x].cells[15].innerText;
	        		var filial = quantidade[x].cells[16].innerText;
	        		var codColForn = quantidade[x].cells[17].innerText;
	        		valorTotal += valor; 
	        		arrMovs += idmov + ',';
	        	}
	        }	        
	        
	        //Remove a última vírgula
	        arrMovs = arrMovs.substring(0,arrMovs.length-1);
	        $('#coligada').val(codcol);
	        $('#arrMovs').val(arrMovs);	        
	        $('#tipoOrigem').val('1.1.02');
	    	$('#nomeFornecedor').val(fornecedor);
	    	$('#cpfCnpj').val(cnpjUnico);
	    	$('#codPgto').val(codPgto);
	    	$('#nomePgto').val(nomePgto);
	    	$('#codForn').val(codForn);
	    	$('#codTrocaForn').val(codForn);
	    	$('#codFormPgto').val(codFormPgto);
	    	$('#nomeFormPgto').val(nomeFormPgto);
	    	$('#filial').val(filial);
	    	$('#codColForn').val(codColForn);
	    
	        // Força o botão ENVIAR (Default)
	        $("#workflowActions > button:first-child",window.parent.document).click();
	        
	    });	    
	   
	}
	
	// ENTRADA DA NF
    if (atividade == 11) {
    	
    	$('.statusFaturado').hide();
    	$('#divInicio').hide();
    	$('#divFaturar').show();
    	$('#divLancamento').hide();
    	
    	formaDePagamento();
    	condicaoDePagamento();
    	dadosBancarios();
    	var fornecedores = buscaFornecedores();
    	FLUIGC.calendar("#dataEmissao");
    	FLUIGC.calendar("#dataCompetencia");
    	
    	$("#serieMovimento").blur(function() {
    		this.value = ("000" + this.value).slice(-3);
    	});
    	
    	$("#numMovimento").blur(function() {
    		this.value = ("000000000" + this.value).slice(-9);
    	});
    	    	
    	var qtdeItens = document.getElementById('tabelaItens').rows.length;
    	var total = 0;
		var valor = 0;
		calculaValorTotal(qtdeItens-1);
		
		for(var x = 1; x < qtdeItens-1; x++) {
			
			$("#QTDE___" + x).keypress(function(){
				$(this).mask('#.##0,0000', {reverse: true});
			});
			
			
			$("#QTDE___" + x).focusout(function(){		
				calculaValor(this);
				calculaValorTotal(qtdeItens-1);				
			});
		}	
			
		$("select[id='formaPgto']").change(function() {
			
			var codigo = $(this).val();
			
			if (codigo == '009') {
				$('#button-dadosPag').show();
			}
			else {
				$('#button-dadosPag').hide();
			}
			
		});
		
		$('#button-avaliar').click( function () {
			
			var myModal = FLUIGC.modal({
			    title: 'Avaliação de Fornecedor',
			    content: "<div class='row'><div class='col-md-12 form-group'><label>Qualidade/Atendimento às especificações </label><div class='my-ratingA'></div></div></div>" +
			    	"<div class='row'><div class='col-md-12 form-group'><label>Cumprimento de prazo </label><div class='my-ratingB'></div></div></div>" +
			    	"<div class='row'><div class='col-md-12 form-group'><label>Comprometimento/Soluções de problemas </label><div class='my-ratingC'></div></div></div>" +
			    	"<div class='row'><div class='col-md-12 form-group'><label>Atendimento aos requisitos de segurança </label><div class='my-ratingD'></div></div></div>"+
			    	"<div class='row'><div class='col-md-12 form-group'><label>Justificativa</label><select id='avaliaJust' name='avaliaJust' class='form-control'>"+
			    		"<option value=''>Selecione a justificativa . . . </option>"+
			    		"<option value='Não atende os requisitos mínimos (técnico, documental e quantidade)'>Não atende os requisitos mínimos (técnico, documental e quantidade)</option>"+
			    		"<option value='Produto/material avariado ou danificado'>Produto/material avariado ou danificado</option>"+
			    		"<option value='Não atendeu o prazo de entrega'>Não atendeu o prazo de entrega</option>"+
			    		"<option value='Não resolveu em tempo hábil as não conformidades'>Não resolveu em tempo hábil as não conformidades</option>"+
			    		"<option value='Demora muito para fazer contato e dar respostas'>Demora muito para fazer contato e dar respostas</option>"+
			    		"<option value='Não se compromete com as normas e regras da Castilho'>Não se compromete com as normas e regras da Castilho</option>"+
			    		"<option value='Não porta e/ou usa equipamentos de segurança'>Não porta e/ou usa equipamentos de segurança</option>"+
			    		"<option value='Não se compromete com as normas de SST da Castilho'>Não se compromete com as normas de SST da Castilho</option>"+
			    		"</select></div></div>"+
			    	"<div class='row'><div class='col-md-10'></div><div class='col-md-2'><button type='button' class='btn btn-primary' onclick='javascript: salvaAval();'>Salvar</button></div></div>",
			    id: 'data-fluig-modal'/*,
			    actions: [{
			        'label': 'Salvar',
			        //'bind': 'data-open-modal',
			        'classType': 'btn btn-primary salvaAvaliacao',
			        'autoClose': true
			    },{
			        'label': 'Cancelar',
			        'autoClose': true
			    }]*/
			}, function(err, data) {
			    if(err) {
			        // do error handling
			    } else {
			       
			    }
			});
	    	
	    	var avaliaA = FLUIGC.stars(".my-ratingA", {
	    	    stars: 10,
	    	    value: 5/*,
	    	    text: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']*/
	    	});
	    	var avaliaB = FLUIGC.stars(".my-ratingB", {
	    	    stars: 10,
	    	    value: 5
	    	});
	    	var avaliaC = FLUIGC.stars(".my-ratingC", {
	    	    stars: 10,
	    	    value: 5
	    	});
	    	var avaliaD = FLUIGC.stars(".my-ratingD", {
	    	    stars: 10,
	    	    value: 5
	    	});
	    	
	    	avaliaA.on("click", function(obj) {	    	    
	    	    var pos = ($(this).index()) + 1;
	            $('#avaliacaoA').val(pos);
	    	});
	    	avaliaB.on("click", function(obj) {
	    		var pos = ($(this).index()) + 1; 
	            $('#avaliacaoB').val(pos);
	    	});
	    	avaliaC.on("click", function(obj) {
	    		var pos = ($(this).index()) + 1; 
	            $('#avaliacaoC').val(pos);
	    	});
	    	avaliaD.on("click", function(obj) {
	    		var pos = ($(this).index()) + 1; 
	            $('#avaliacaoD').val(pos);
	    	});
		
		});
		
		$('#button-fornecedor').click( function () {
			
			var codigo = $('#codTrocaForn').val();
			var conteudo = fornecedores;
			
			var myModal = FLUIGC.modal({
			    title: 'Escolha o Fornecedor:',
			    content: conteudo+
			    	"<div class='row'><div class='col-md-10'></div><div class='col-md-2'><button type='button' class='btn btn-primary' onclick='javascript: salvaDadosFornecedor();'>Salvar</button></div></div>",
			    id: 'data-fluig-modal-fornecedor'
			}, function(err, data) {
			    if(err) {
			        // do error handling
			    } else {
			       
			    }
			});
			
			
			$('#radioForn'+codigo).attr('checked', true);
			
		});
		
		$('#button-dadosPag').click( function () {
			
			var campo1 = $('#descricaoPag').val();
			var campo2 = $('#bancoPag').val();
			var campo3 = $('#agenciaPag').val();
			var campo4 = $('#digAgenciaPag').val();
			var campo5 = $('#contaPag').val();
			var campo6 = $('#digContaPag').val();
			var campo7 = $('#tipoPag').val();
			var campo8 = $('#favorecidoPag').val();
			var campo9 = $('#cpfCnpjPag').val();
			var selectTipo = '<select class="form-control" name="modalPag7" id="modalPag7">'; 
			
			if(campo7 != ""){
				
				var descrTipo = "";
			
				switch(campo7) {
					case "1":
						descrTipo = "Conta Corrente Individual";
						break;
					case "2":
						descrTipo = "Conta Poupança Individual";
						break;
					case "3":
						descrTipo = "Conta Depósito Judicial/Em Consignação Individual";
						break;
					case "11":
						descrTipo = "Conta Corrente Conjunta";
						break;
					case "12":
						descrTipo = "Conta Poupança Conjunta";
						break;
					case "13":
						descrTipo = "Conta Depósito Judicial/Em Consignação Conjunta";
						break;
					case false:
						descrTipo = "";
				}
				
				selectTipo += '<option value="'+ campo7 +'" selected>'+ descrTipo +'</option>';
				
			}
			else {
				
				selectTipo += '<option value=""></option>';
			}
			
			selectTipo += '<option value="1">Conta Corrente Individual</option>';
			selectTipo += '<option value="2">Conta Poupança Individual</option>';	
			selectTipo += '<option value="3">Conta Depósito Judicial/Em Consignação Individual</option>';	
			selectTipo += '<option value="11">Conta Corrente Conjunta</option>';	
			selectTipo += '<option value="12">Conta Poupança Conjunta</option>';	
			selectTipo += '<option value="13">Conta Depósito Judicial/Em Consignação Conjunta</option>';	
			selectTipo += '</select>';
						
			var myModal = FLUIGC.modal({
			    title: 'Informações de Pagamento',
			    content: "<div class='row'><div class='col-md-6 form-group'><label>Descrição: </label><input id='modalPag1' name='modalPag1' class='form-control' placeholder='Banco ABC' maxlength='40' value='"+campo1+"' /></div>" +
			    		"<div class='col-md-6 form-group'><label>Banco: </label><input id='modalPag2' name='modalPag2' class='form-control' placeholder='000' maxlength='3' value='"+campo2+"' /></div></div>" +
		    		"<div class='row'><div class='col-md-3 form-group'><label>Agência: </label><input id='modalPag3' name='modalPag3' class='form-control' placeholder='000000' maxlength='6' value='"+campo3+"' /></div>" +
			    		"<div class='col-md-3 form-group'><label>Dígito: </label><input id='modalPag4' name='modalPag4' class='form-control' placeholder='00' maxlength='2' value='"+campo4+"' /></div>" +
			    		"<div class='col-md-3 form-group'><label>Conta C.: </label><input id='modalPag5' name='modalPag5' class='form-control' placeholder='000000000000000' maxlength='15' value='"+campo5+"' /></div>" +
			    		"<div class='col-md-3 form-group'><label>Dígito C.C.: </label><input id='modalPag6' name='modalPag6' class='form-control' placeholder='00' maxlength='2' value='"+campo6+"' /></div></div>" +
			    	"<div class='row'><div class='col-md-12 form-group'><label>Tipo: </label>"+selectTipo+"</div></div>"+
			    	"<div class='row'><div class='col-md-12 form-group'><label>Favorecido: </label><input id='modalPag8' name='modalPag8' class='form-control' placeholder='Nome do Favorecido' maxlength='60' value='"+campo8+"' ></div></div>"+
			    	"<div class='row'><div class='col-md-12 form-group'><label>CPF/CNPJ: </label><input id='modalPag9' name='modalPag9' class='form-control' placeholder='CPF/CNPJ do Favorecido' maxlength='20' value='"+campo9+"' ></div></div>"+
			    	"<div class='row'><div class='col-md-10'></div><div class='col-md-2'><button type='button' class='btn btn-primary' onclick='javascript: salvaDadosPgto();'>Salvar</button></div></div>",
			    id: 'data-fluig-modal-dadosPag'
			}, function(err, data) {
			    if(err) {
			        // do error handling
			    } else {
			       
			    }
			});
		});
				
		// Envia os movimentos para a próxima etapa
	    $('#button-faturar').click( function () {    	
	    	
	    	// Força o botão ENVIAR (Default)
	        $("#workflowActions > button:first-child",window.parent.document).click();	        
	    });
		
	    
    }
    
    // FINANCEIRO
    if(atividade == 14) {
		
    	$('.statusFaturado').hide();
    	$('#divInicio').hide();
    	$('#divFaturar').hide();
    	$('#divLancamento').show();    	
    	
    	var trocaCodigo = $('#codTrocaForn').val();
    	var trocaNome = $('#nomeTrocaForn').val();
    	var trocaCnpj = $('#cnpjTrocaForn').val();
    	
    	if (trocaCodigo != '' && trocaNome != '' && trocaCnpj != '') {
    		$('#codigoForn').html(trocaCodigo);
    		$('#tituloForn').html(trocaNome);
    		$('#cnpjForn').html(trocaCnpj);
    	}
    	else {    	
    		$('#codigoForn').html($('#codForn').val());
    		$('#tituloForn').html($('#nomeFornecedor').val());
    		$('#cnpjForn').html($('#cpfCnpj').val());
    	}
    	
    	var codigo = $('#codFormPgto').val();    	     	
    	var qtdeItens = document.getElementById('tabelaLanItens').rows.length;
    	$('#qtdeParcelas').val(qtdeItens-2);
    	calculaValorParcelas(qtdeItens-1);
    	
    	if (codigo == '009') {
    		$('td.codigoBarras').html('<b>Dados Bancários</b>');  
    	}
    	
		for(var x = 1; x < qtdeItens-1; x++) {
			
			FLUIGC.calendar("#DATAVENC___" + x);
			FLUIGC.calendar("#DATAPREV___" + x);
		
			if (codigo == '001') {
				$("#CODIGOBARRA___" + x).prop("readonly",false);
			}
			else {
				$("#CODIGOBARRA___" + x).prop("readonly",true);
				
				if (codigo == '009') {
					
					var descr = $('#descricaoPag').val();
					var banco = $('#bancoPag').val();
					var agencia = $('#agenciaPag').val();
					var digAg = $('#digAgenciaPag').val();
					var conta = $('#contaPag').val();
					var digConta = $('#digContaPag').val();
					
					if (digAg != "") {
						agencia = agencia + '-' + digAg;
					}
					
					if (digConta != "") {
						conta = conta + '-' + digConta;
					}
					
		    		$("#CODIGOBARRA___" + x).val(descr+ ' (' +banco+ ') Ag: ' +agencia+ ' / ' +conta);  
		    	}
			}
			
			if (qtdeItens >= 4) {
				$("#VALOR___" + x).prop("readonly",false);
				$("#VALOR___" + x).keypress(function(){
					$(this).mask('#.##0,00', {reverse: true});
				});
				
				$("#VALOR___" + x).focusout(function(){
					calculaValorParcelas(qtdeItens-1);
				});
			}
			else {
				$("#VALOR___" + x).prop("readonly",true);
			}			
			
		}	
		
		// Envia os lançamentos para atualizar
	    $('#button-lancamento').click( function () {
	    	
	    	// Força o botão ENVIAR (Default)
	        $("#workflowActions > button:first-child",window.parent.document).click();	        
	    });
			
	}
    
    // FIM
    if(atividade == 16) {
		
		console.log($('#resultadoMsg').val());
		
		$('#msgRetorno').html('');
		$('#msgRetorno').html($('#resultadoMsg').val());
		$('.statusFaturado').show();
	}
    
    
    
} );


