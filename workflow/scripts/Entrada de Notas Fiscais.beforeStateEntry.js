function beforeStateEntry(sequenceId){
		 
	log.info("SEQUENCE INICIAL = "+ sequenceId);
	
	var usuario = getValue("WKUser");

	if (usuario == 'alysson.silva1') {
		usuario = 'Alysson.Silva';
	}
	
	if (usuario == 'fernando.jarvorski') {
		usuario = 'fernandoj';
	}
		
	// ENTRADA DA NF
	if (sequenceId == 11) {
		
		hAPI.setCardValue("usuario", usuario);
		
		var movimentos = hAPI.getCardValue('arrMovs');
		var coligada = hAPI.getCardValue('coligada');		
		var tipoMov = "";
		var nomeColigada = "";
		
		if (coligada == "1")
			nomeColigada = "1 - CONSTRUTORA CASTILHO"; 
		if (coligada == "2")
			nomeColigada = "2 - CASTILHO MINERACAO";
		if (coligada == "3")
			nomeColigada = "3 - AMC EMPREENDIMENTOS";
		if (coligada == "4")
			nomeColigada = "4 - SUCURSAL PERU"; 
		if (coligada == "5")
			nomeColigada = "5 - CONSORCIO CONSTRUTOR TUNEL ESTACAO LUZ"; 
		if (coligada == "6")
			nomeColigada = "6 - CONSORCIO CASTILHO - ARTELESTE"; 
		if (coligada == "7")
			nomeColigada = "7 - CASTILHO GUIANA";
		if (coligada == "8")
			nomeColigada = "8 - CONSORCIO CASTILHO - ECAM / PETROLINA";
		if (coligada == "9")
			nomeColigada = "9 - COLIGADA 9";
		if (coligada == "10")
			nomeColigada = "10 - CONSORCIO CASTILHO - GROS / PATIO SANTOS";
				
		hAPI.setCardValue("nomeColigada", nomeColigada);
		hAPI.setCardValue("atividade",sequenceId);
		
		buscaItens(movimentos, coligada,"tabelaItens");	
	}
	
	// FINANCEIRO
	if (sequenceId == 14) {
		
		hAPI.setCardValue("atividade",sequenceId);
		hAPI.setCardValue("usuario", usuario);
		
		var coligada = hAPI.getCardValue('coligada');
		var filial = hAPI.getCardValue('filial');
		var movGerado = hAPI.getCardValue('geraMovimento');
		var codForn = hAPI.getCardValue('codForn');
		var serie = hAPI.getCardValue('serieMovimento');
		var numMovimento = hAPI.getCardValue('numMovimento');
		var chaveAcesso = hAPI.getCardValue('chaveAcesso');		
		var avaliacaoA = hAPI.getCardValue('avaliacaoA');
		var avaliacaoB = hAPI.getCardValue('avaliacaoB');
		var avaliacaoC = hAPI.getCardValue('avaliacaoC');
		var avaliacaoD = hAPI.getCardValue('avaliacaoD');
		var justifica = hAPI.getCardValue('justificativa');
		
		// Executa 1ª vez para buscar o número do movimento
		buscaLancamentos(coligada,filial,movGerado,codForn,serie,numMovimento,chaveAcesso,"");
		
		avaliaFornecedor(avaliacaoA, avaliacaoB, avaliacaoC, avaliacaoD, justifica);
		var codTrocaForn = hAPI.getCardValue('codTrocaForn');
		if (codTrocaForn != codForn) {
			log.info("FORNEC DIFERENTE");
			buscaLancamentos(coligada,filial,movGerado,codTrocaForn,serie,numMovimento,chaveAcesso,"tabelaLanItens");
		} else {
			log.info("FORNEC IGUAL");
			buscaLancamentos(coligada,filial,movGerado,codForn,serie,numMovimento,chaveAcesso,"tabelaLanItens");			
		} 
		
	}
	
	// FIM
	if (sequenceId == 16) {
		hAPI.setCardValue("atividade",sequenceId);
		hAPI.setCardValue("usuario", usuario);
	}
}
//Função busca os itens do Movimento e alimenta as linhas da tabela pai-filho
function buscaItens(paramIdmov, paramCodcoligada, nomeTabela) 
{ 
	var c1 = DatasetFactory.createConstraint("pCodCol", paramCodcoligada, paramCodcoligada, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pIdMov", paramIdmov, paramIdmov, ConstraintType.MUST);
	var constraints = new Array(c1, c2);
	var dataset = DatasetFactory.getDataset("ConsultaItemMov", null, constraints, null);
	var total = 0;
	
	for (var x = 0; x < dataset.values.length; x++)
	{			
		var itens = new java.util.HashMap();
		for (var y = 0; y < dataset.columnsCount; y++)
		{
			var coluna = dataset.columnsName[y];
			var campo = dataset.values[x][y];		
						
			if (coluna == 'QTDE'){				
				campo = FormataValor(campo,4);
			}
			
			if (coluna == 'PRECOTOTAL'){
				campo = parseFloat(campo);
				total = total + campo;
				campo = campo.toFixed(2);
			}
			
			itens.put(coluna, campo);
		}
		hAPI.addCardChild(nomeTabela, itens);		
	}
	
	hAPI.setCardValue("total",total.toFixed(2));
	
}
//Função busca as informações dos lançamentos financeiros e alimenta as linhas da tabela pai-filho
function buscaLancamentos(coligada,filial,movGerado,codForn,serie,numMovimento,chaveAcesso, nomeTabela) 
{ 
	var c1 = DatasetFactory.createConstraint("pColigada", coligada, coligada, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pFilial", filial, filial, ConstraintType.MUST);
	var c3 = DatasetFactory.createConstraint("pCodForn", codForn, codForn, ConstraintType.MUST);
	var c4 = DatasetFactory.createConstraint("pSerie", serie, serie, ConstraintType.MUST);
	var c5 = DatasetFactory.createConstraint("pNumeroMov", numMovimento, numMovimento, ConstraintType.MUST);
	var c6 = DatasetFactory.createConstraint("pCodTmv", movGerado, movGerado, ConstraintType.MUST);
	var c7 = DatasetFactory.createConstraint("pChaveAcesso", chaveAcesso, chaveAcesso, ConstraintType.MUST);
	var constraints = new Array(c1, c2, c3, c4, c5, c6, c7);
	var dataset = DatasetFactory.getDataset("ConsultaLanFinanceiro", null, constraints, null);
	var total = 0.00;
	
	var codFornAtual = hAPI.getCardValue('codForn');
	var codigoForn = "";
	
	for (var x = 0; x < dataset.values.length; x++)
	{			
		var itens = new java.util.HashMap();
		for (var y = 0; y < dataset.columnsCount; y++)
		{
			var coluna = dataset.columnsName[y];
			var campo = dataset.values[x][y];		
			
			if (coluna == 'IDMOV') {
				hAPI.setCardValue("idmovNF",campo);
			}
			
			if (coluna == 'CODIGOFORN') {
				codigoForn = campo;
			}
			
			if (codigoForn != codFornAtual && codigoForn != "") {
			
				if (coluna == 'CODIGOFORN') {
					hAPI.setCardValue("codTrocaForn",campo);
				}
				if (coluna == 'RAZAOSOCIAL') {
					hAPI.setCardValue("nomeTrocaForn",campo);
				}
				if (coluna == 'CPFCNPJ') {
					hAPI.setCardValue("cnpjTrocaForn",campo);
				}
			}
			else {
				if (coluna == 'VALOR'){
					
					var soma = parseFloat(campo);
					total = total + soma;
					
					campo = FormataValor(campo,2);
				}
				
				itens.put(coluna, campo);
			}
		}
		log.info("ACESSOU LAN ANTES");
		if (nomeTabela != '') {
			log.info("ACESSOU LAN DEPOIS NomeTabela = "+nomeTabela);
			hAPI.addCardChild(nomeTabela, itens);
		}
	}
	
	hAPI.setCardValue("total",total.toFixed(2));
}
function avaliaFornecedor(a,b,c,d,jus){
	
	var processo = getValue("WKNumProces");
	var usuario = hAPI.getCardValue('usuario');
	var coligada = hAPI.getCardValue('coligada');
	var idmov = hAPI.getCardValue('idmovNF');
	var trocaFornecedor = hAPI.getCardValue('codTrocaForn');
	var url = "http://fluig.castilho.com.br:1010/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID="+processo;
	
	var newXml = new String; 
	newXml +="<MovMovimento>";		
		newXml +="<TMOV>";		
			newXml +="<CODCOLIGADA>" + coligada + "</CODCOLIGADA>";
			newXml +="<IDMOV>"+ idmov +"</IDMOV>";
			newXml +="<USUARIO>"+ usuario +"</USUARIO>";
			newXml +="<CODCFO>"+ trocaFornecedor +"</CODCFO>";
		newXml +="</TMOV>";	
		newXml +="<TMOVCOMPL>";
			newXml +="<CODCOLIGADA>" + coligada + "</CODCOLIGADA>";
			newXml +="<IDMOV>"+ idmov +"</IDMOV>";
			newXml +="<FLUIG>"+ url +"</FLUIG>";
		
	if (a != "" && b != "" && c != "" && d != "") {		
			newXml +="<AVF_A>" + a + "</AVF_A>";
			newXml +="<AVF_B>" + b + "</AVF_B>";
			newXml +="<AVF_C>" + c + "</AVF_C>";
			newXml +="<AVF_D>" + d + "</AVF_D>";
			newXml +="<JUSTIF>" + jus + "</JUSTIF>";
	}
	
		newXml +="</TMOVCOMPL>";
	newXml +="</MovMovimento>";	
		
	var c1 = DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
	var constraints = new Array(c1, c2);
	var retorno = DatasetFactory.getDataset("AtualizaMovimento", null, constraints, null);
	
	log.info("RETORNO = "+retorno.values[0][1]);

	if (!retorno || retorno == "" || retorno == null) 
	{
		throw "Houve um erro na comunicação com o webservice. Tente novamente!";
	}
	else 
	{
		if (retorno.values[0][0] == "false") 
		{
			throw "Não foi possível atualizar o movimento. Motivo: "+retorno.values[0][1] +". Favor verificar as informações ou entrar em contato com o administrador do sistema.";
		}
		else
		{
			return true;
		}
	}
}
function FormataValor(valor,casas){
	var numero = parseFloat(valor);
	numero = numero.toFixed(casas).split('.');
    numero[0] = numero[0].split(/(?=(?:...)*$)/).join('.');
    return numero.join(',');	
}
/*function FormataNumerico(valor)
{
	var valorformat = valor.replace(".",",");
	comaposition = valor.indexOf(".");
	valorformat = valorformat.substring(0,comaposition+3);
	return valorformat;
}*/
