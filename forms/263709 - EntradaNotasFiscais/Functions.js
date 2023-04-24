function listaMovimento(){
	
	var usuario = $('#usuario').val();
	
	var c1 = DatasetFactory.createConstraint("pUsuario", usuario, usuario, ConstraintType.MUST);
	
	var constraints = new Array(c1);
	var dataset = DatasetFactory.getDataset("ConsultaMovAFaturar", null, constraints, null);
   	
	return dataset.values;
}
function FormataMoeda(valor){
	var numero = parseFloat(valor);
	numero = numero.toFixed(2).split('.');
    numero[0] = "R$ " + numero[0].split(/(?=(?:...)*$)/).join('.');
    return numero.join(',');	
}
function FormataNumerico(valor){
	var valorformat = valor.replace(".",",");
	comaposition = valor.indexOf(".");
	valorformat = valorformat.substring(0,comaposition+3);
	return valorformat;
}
function FormataValor(valor,casas){
	var numero = parseFloat(valor);
	numero = numero.toFixed(casas).split('.');
    numero[0] = numero[0].split(/(?=(?:...)*$)/).join('.');
    return numero.join(',');	
}
/* Exibe os campos do detalhe da linha para Grid Por Movimento */
function showDetails(codcol, idmov, solicitante, comprador, aprovador, url){
    
	var c1 = DatasetFactory.createConstraint("pCodCol", codcol, codcol, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pIdMov", idmov, idmov, ConstraintType.MUST);
	var constraints = new Array(c1, c2);
	var dataset = DatasetFactory.getDataset("ConsultaItemMov", null, constraints, null);
	
	var retorno = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">';
	retorno += '<thead><tr><th>Item</th><th>Coligada</th><th>Filial</th><th>Local Estoque</th><th>Produto</th><th>Quantidade</th><th style="text-align: right">Preço Unit.</th><th style="text-align: right">Preço Total</th></tr></thead>';
	retorno += '<tbody>';
	
	for (var x = 0; x < dataset.values.length; x++)
	{			
		retorno += '<tr>';
		retorno += '<td>'+dataset.values[x]["NSEQ"]+'</td>';
		retorno += '<td>'+dataset.values[x]["COLIGADA"]+'</td>';
		retorno += '<td>'+dataset.values[x]["FILIAL"]+'</td>';
		retorno += '<td>'+dataset.values[x]["LOCALESTOQUE"]+'</td>';
		retorno += '<td>'+dataset.values[x]["PRODUTO"]+'</td>';
		retorno += '<td class="direita">'+FormataValor(dataset.values[x]["QTDE"],4)+' '+dataset.values[x]["UNIDADE"]+'</td>';
		retorno += '<td class="direita">'+FormataValor(dataset.values[x]["PRECOUNID"],6)+'</td>';
		retorno += '<td class="direita">'+FormataValor(dataset.values[x]["PRECOTOTAL"],2)+'</td>';
			
		retorno += '</tr>';
		
	}
	retorno += '</tbody>';
	retorno += '<tfoot style="font-weight: bold;">';
	retorno += '<tr><td colspan="2">Solicitante: '+solicitante+'</td><td colspan="2">Comprador: '+comprador+'</td><td colspan="2">Aprovador: '+aprovador+'</td><td colspan="2">Para mais detalhes <a href="'+url+'" target="_blank" rel="noopener" style="text-decoration: underline;"> clique aqui.</a></td></tr>'
	retorno += '</tfoot></table>';
	
	return retorno;	
}
function calculaValor(campo){
	
	var nome = campo.name;
	var linha = nome.substring(7, nome.length);	
	
	var qtde = $("#QTDE___" + linha).val();
	if (qtde != "") { 
	
		qtde = qtde.replace(".","");
		qtde = qtde.replace(".","");
		qtde = qtde.replace(",",".");
		qtde = parseFloat(qtde);
		var valor = $("#PRECOUNID___" + linha).val();
		var valorTotal = (qtde * valor); 	
	}
	else {
		var valorTotal = 0.00; 
	}
	
	$("#PRECOTOTAL___" + linha).val(valorTotal.toFixed(2));
}
function calculaValorTotal(qtde){
	
	var total = $("#total").val();
	var calc = 0;	
	
	for(var x = 1; x < qtde; x++) {
		calc = calc + parseFloat($("#PRECOTOTAL___" + x).val());		
	}
	
	$("#valorTotal").val(FormataMoeda(calc));
	$('#labelTotal').html(FormataMoeda(calc));
	
	var limite = (total*1.1).toFixed(2);
	var atual = calc.toFixed(2)

	if (parseFloat(limite) < parseFloat(atual)) {
		FLUIGC.message.error({
		    title: 'Atenção!',
		    message: 'Valor da Nota Fiscal está acima do limite. Por favor, verifique e tente novamente!'
		}, function(el, ev) {		   		 
		    
		});
	}
}
function calculaValorParcelas(qtde){
	
	var total = $("#total").val();
	var calc = 0;	
	
	for(var x = 1; x < qtde; x++) {
		
		var val = $("#VALOR___" + x).val();
		val = val.replace(".","");
		val = val.replace(".","");
		val = val.replace(",",".");
		
		calc = calc + parseFloat(val);	
	}
	
	$('#labelTotal2').html(FormataMoeda(calc));
	
	var atual = calc.toFixed(2);

	if (parseFloat(total) != parseFloat(atual)) {
		FLUIGC.message.error({
		    title: 'Atenção!',
		    message: 'A soma das parcelas difere do valor da Nota Fiscal. Por favor, verifique e tente novamente!'
		}, function(el, ev) {		   		 
		    
		});
	}
}
function formaDePagamento(){

	var opcao = $("#coligada").val();
	var codFormPgto = $("#codFormPgto").val();
	var nomeFormPgto = $("#nomeFormPgto").val();
	var parametro1 = DatasetFactory.createConstraint("CODCOLIGADA", opcao , opcao, ConstraintType.MUST);
	var parametro2 = DatasetFactory.createConstraint("ATIVO", 1, 1, ConstraintType.MUST);
	
    var vetor = new Array(parametro1, parametro2);
    var sortingFields = new Array("CODTB1FLX");
	var retorno = DatasetFactory.getDataset("FormaPagamentoRM", null, vetor, sortingFields);
	
	if (!retorno || retorno == "" || retorno == null ) 
	{
		throw "Houve um erro na comunicação com o banco de dados. Tente novamente!";
		console.log("FALHA = " + retorno);
	}
	else 
	{	 
		var selectFormaPag = '<select class="form-control" name="formaPgto" id="formaPgto">';
		
		var obj = Object.keys(retorno).map(function(key) {
		  return [Number(key), retorno[key]];
		});

		var arr = obj[1][1];
		for (var j = 0; j < arr.length; j++) {
			if(j == 0){
				selectFormaPag += '<option value="'+ codFormPgto +'" selected>'+ nomeFormPgto +'</option>';
			}
			selectFormaPag += '<option value="'+arr[j]["CODTB1FLX"]+'">'+arr[j]["DESCRICAO"]+'</option>';				
		}
		
		selectFormaPag += '</select>';
		$('#formaPgto').html(selectFormaPag);
	} 	
	
	// Depósito C/C
	if (codFormPgto == '009') {
		$('#button-dadosPag').show();
	}
}
function condicaoDePagamento(){

	var opcao = $("#coligada").val();
	var codPgto = $("#codPgto").val();
	var nomePgto = $("#nomePgto").val();
	var parametro1 = DatasetFactory.createConstraint("CODCOLIGADA", opcao , opcao, ConstraintType.MUST);
	var parametro2 = DatasetFactory.createConstraint("INATIVO", 0, 0, ConstraintType.MUST);
	
    var vetor = new Array(parametro1, parametro2);
    var sortingFields = new Array("CODCPG");
	var retorno = DatasetFactory.getDataset("TCPG", null, vetor, sortingFields);
	
	if (!retorno || retorno == "" || retorno == null ) 
	{
		throw "Houve um erro na comunicação com o banco de dados. Tente novamente!";
		console.log("FALHA = " + retorno);
	}
	else 
	{	 
		var selectCondPag = '<select class="form-control" name="condicaoPgto" id="condicaoPgto">';
		
		var obj = Object.keys(retorno).map(function(key) {
		  return [Number(key), retorno[key]];
		});

		var arr = obj[1][1];
		for (var j = 0; j < arr.length; j++) {
			if(j == 0){
				selectCondPag += '<option value="'+ codPgto +'" selected>'+ nomePgto +'</option>';
			}
			selectCondPag += '<option value="'+arr[j]["CODCPG"]+'">'+arr[j]["NOME"]+'</option>';				
		}
		
		selectCondPag += '</select>';
		$('#condicaoPgto').html(selectCondPag);
	} 	
}
function buscaFornecedores(){
	
	var codColForn = $('#codColForn').val();	
	var cpfCnpj = $('#cpfCnpj').val();
	var retorno = '';
	var qtdeFornecedores = 0
	
	if (cpfCnpj.length > 14) {
		cpfCnpj = cpfCnpj.substring(0, 11);
	
		var parametro1 = DatasetFactory.createConstraint("CODCOLIGADA", codColForn , codColForn, ConstraintType.MUST);
		var parametro2 = DatasetFactory.createConstraint("CGCCFO", cpfCnpj, cpfCnpj, ConstraintType.MUST);
	
		var vetor = new Array(parametro1, parametro2);
		var dataset = DatasetFactory.getDataset("ConsultaFilialFornecedor", null, vetor, null);
		
		for (var x = 0; x < dataset.values.length; x++)
		{			
			retorno += '<div class="custom-radio custom-radio-primary">';
			retorno += '<input type="radio" name="troca-fornecedor" value="'+dataset.values[x]["CODCFO"]+'" id="radioForn'+dataset.values[x]["CODCFO"]+'">';
			retorno += '<label for="radioForn'+dataset.values[x]["CODCFO"]+'">'+dataset.values[x]["NOMEFANTASIA"]+' - '+dataset.values[x]["CGCCFO"]+'</label>';
			retorno += '</div>';
			
			qtdeFornecedores = qtdeFornecedores + 1;
		}
		
	}
	retorno += '';
	
	if (qtdeFornecedores > 1) {
		$('#button-fornecedor').show();
		
		$('#labelListaFornecedores').show();
	}
	
	return retorno;
}
function dadosBancarios(){
	
	var coligada = $('#coligada').val();
	var codColForn = $('#codColForn').val();
	var fornecedor = $('#codForn').val();
	
	var parametro1 = DatasetFactory.createConstraint("pColigada", coligada , coligada, ConstraintType.MUST);
	var parametro2 = DatasetFactory.createConstraint("pCodColForn", codColForn , codColForn, ConstraintType.MUST);
	var parametro3 = DatasetFactory.createConstraint("pCodForn", fornecedor, fornecedor, ConstraintType.MUST);
	
    var vetor = new Array(parametro1, parametro2,parametro3);   
	var retorno = DatasetFactory.getDataset("ConsultaDadosBancariosForn", null, vetor, null);
	
	if (!retorno || retorno == "" || retorno == null ) 
	{
		throw "Houve um erro na comunicação com o banco de dados. Tente novamente!";
		console.log("FALHA = " + retorno);
	}
	else 
	{
		
		var obj = Object.keys(retorno).map(function(key) {
		  return [Number(key), retorno[key]];
		});

		var arr = obj[1][1];

		if (arr[0]["STATUS"]) {
			
			$('#idPagForn').val(arr[0]["IDPGTO"]);
			$('#descricaoPag').val(arr[0]["DESCRICAO"]);
			$('#bancoPag').val(arr[0]["BANCO"]);
			$('#agenciaPag').val(arr[0]["CODAGENCIA"]);
			$('#digAgenciaPag').val(arr[0]["DIGAGENCIA"]);
			$('#contaPag').val(arr[0]["CONTACORRENTE"]);
			$('#digContaPag').val(arr[0]["DIGCONTA"]);
			$('#tipoPag').val(arr[0]["TIPO"]);
			$('#favorecidoPag').val(arr[0]["FAVORECIDO"]);
			$('#cpfCnpjPag').val(arr[0]["CGCFAVORERIDO"]);
			
		}
		
	}
	
}
function salvaAval(){
	
	var avalA = $('#avaliacaoA').val();
	var avalB = $('#avaliacaoB').val();	
	var avalC = $('#avaliacaoC').val();	
	var avalD = $('#avaliacaoD').val();	
	var justifica = $('#avaliaJust').val();

	//if (avalA != "" && avalB != "" && avalC != "" && avalD != "" && justifica != "" && justifica.length >= 10) {
	if (avalA != "" && avalB != "" && avalC != "" && avalD != "") {
		
		if (avalA <= 6 || avalB <= 6 || avalC <= 6 || avalD <= 6) {
			
			if (justifica == "") {
				FLUIGC.message.error({
				    title: 'Erro!',
				    message: 'Por favor, justifique a sua avaliação!'
				}, function(el, ev) {		   		 
				    
				});
			}
			else {
				
				$('#justificativa').val(justifica);
			
				var classe = document.getElementsByClassName("close");
				var modal = classe[0];
				modal.click();
			}
			
		}
		else {
		
			$('#justificativa').val(justifica);
		
			var classe = document.getElementsByClassName("close");
			var modal = classe[0];
			modal.click();
		}
	}
	else {
		FLUIGC.message.error({
		    title: 'Erro!',
		    message: 'Para avaliar o fornecedor, é necessário o preenchimento de todos os requisitos da avaliação!'
		}, function(el, ev) {		   		 
		    
		});
	}
}
function salvaDadosPgto(){
	
/***************************************************************
	VALORES DEFINIDOS P/ CAMPO TIPO
	Conta Corrente Individual = 1
	Conta Poupança Individual = 2
	Conta Depósito Judicial/Em Consignação Individual = 3	
	Conta Corrente Conjunta = 11
	Conta Poupança Conjunta = 12
	Conta Depósito Judicial/Em Consignação Conjunta = 13
****************************************************************/
	
	var descricao = $('#modalPag1').val();
	var banco = $('#modalPag2').val();
	var agencia = $('#modalPag3').val();
	var digAgencia = $('#modalPag4').val();
	var conta = $('#modalPag5').val();
	var digConta = $('#modalPag6').val();
	var tipo = $('#modalPag7').val();
	var favorecido = $('#modalPag8').val();
	var cpfFavorecido = $('#modalPag9').val();
	
	if (descricao != "" && banco != "" && agencia != "" && conta != "" && tipo != "" && favorecido != "" && cpfFavorecido != "") {
		
		$('#descricaoPag').val(descricao);
	    $('#bancoPag').val(banco);
		$('#agenciaPag').val(agencia);
		$('#digAgenciaPag').val(digAgencia);
		$('#contaPag').val(conta);
		$('#digContaPag').val(digConta);
		$('#tipoPag').val(tipo);
		$('#favorecidoPag').val(favorecido);
		$('#cpfCnpjPag').val(cpfFavorecido);
		
		$('#atualizaBancoForn').val(1);
		
		var classe = document.getElementsByClassName("close");
		var modal = classe[0];
		modal.click();
	}
	else {
		FLUIGC.message.error({
			    title: 'Erro!',
			    message: 'Para atualizar os dados de pagamento, é necessário o preenchimento de todos os campos!'
			}, function(el, ev) {		
		});
	}
}
function salvaDadosFornecedor(){

	var novoFornecedor = $('input[name="troca-fornecedor"]:checked').val();
	
	if (novoFornecedor != '') {
		$('#codTrocaForn').val(novoFornecedor);
		
		var classe = document.getElementsByClassName("close");
		var modal = classe[0];
		modal.click();
	}
	else {
		FLUIGC.message.error({
			    title: 'Erro!',
			    message: 'Por favor, marque o fornecedor escolhido!'
			}, function(el, ev) {
		});
	}

}
function listaFornecedores(){
	$('#button-fornecedor')[0].click();
}