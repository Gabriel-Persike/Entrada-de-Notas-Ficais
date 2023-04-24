function beforeTaskSave(colleagueId,nextSequenceId,userList) {
	
	/*	var dateFormat = new java.text.SimpleDateFormat("HH:mm:ss");
	
		var agora      = dateFormat.format(new Date())
	
		if (agora >= '15:00:00') { 
		throw "Processo não pode ser iniciado após as 15:00!" 
		}
	*/
	
	var processo = getValue("WKNumProces");
	var atividade = getValue('WKCurrentState');	
	var movimentos = hAPI.getCardValue('arrMovs');
	var mensagemErro = hAPI.getCardValue('mensagemErro');
	var proximaAtividade = nextSequenceId;
	
	if (mensagemErro != null && mensagemErro != 'OK' && mensagemErro != '')
		throw mensagemErro;
	
	// ENTRADA DA NF
	if (atividade == 11 && proximaAtividade == 14) {
		
		var atualizaBancoFor = hAPI.getCardValue('atualizaBancoForn');
		var pagamentoAntigo = hAPI.getCardValue('codPgto');
		var pagamentoAtual = hAPI.getCardValue('condicaoPgto');
		var formaPgtoAntigo = hAPI.getCardValue('codFormPgto');
		var formaPgtoAtual = hAPI.getCardValue('formaPgto');
		var tipoMovimento = hAPI.getCardValue('geraMovimento');
		var faturaMov = true;
		var betuminoso = false;
		
		// Verifica se a NF não se encontra cancelada no MDE
		if (tipoMovimento == '1.2.01' || tipoMovimento == '1.2.08') {
			
			verificaManifesto();			
			
		}	
		
		// Nota Fiscal - Betuminosos
		if (tipoMovimento == '1.2.01') {
			 var anexos = hAPI.listAttachments();
			 
			 var campos   = hAPI.getCardData(processo);
			 var contador = campos.keySet().iterator();
			 var indexes  = 0;
		    	
			 while (contador.hasNext()) {
				 var id = contador.next();
		    	    
				 if (id.match(/IDRM___/)) { 
					 var campo = campos.get(id);
					 var seq   = id.split("___");
					 var grupo = hAPI.getCardValue("CODGRUPOPRODUTO___" + seq[1]);
					 
					 // BETUMINOSOS
					 if (grupo == '01') {
						 betuminoso = true;
					 }					 
	    	    }
	    	}
    	 
			if (anexos.size() == 0 && betuminoso) {
				 throw "Por favor, insira a NF digitalizada e o XML na aba de Anexos";
			}
		}
		
		// Nota Manual
		if (tipoMovimento == '1.2.24') {
			 var anexos = hAPI.listAttachments();
			 
			 if (anexos.size() == 0) {
				 throw "Por favor, insira a NF digitalizada na aba de Anexos";
			 }
		}
		
		// Altera o pagamento antes de faturar
		if (pagamentoAntigo != pagamentoAtual || formaPgtoAntigo != formaPgtoAtual) {
			faturaMov = atualizaMovimento();			
		}
		
		if (formaPgtoAtual == '009' && atualizaBancoFor) {
			
			atualizaDadosPagFornecedor();
			
		}
		
		if (faturaMov) {
			faturamento(betuminoso);
			hAPI.setCardValue("codFormPgto",formaPgtoAtual);
			
		}
		else {
			throw "Falha ao atualizar/faturar movimento: Motivo: "+faturaMov;
		}
		
		
	}
	
	// FINANCEIRO
	if (atividade == 14 && proximaAtividade == 16) {
		
		var parcelas = hAPI.getCardValue('qtdeParcelas');
		
		if (parcelas >= 2) {
			atualizaParcelas();
		}
		
		atualizaLancamento();
		
	}
	
}
function faturamento(betuminoso){
	
	var processo = getValue("WKNumProces");
	var usuario = hAPI.getCardValue('usuario');
	var coligada = hAPI.getCardValue('coligada');
	var tipoOrigem = hAPI.getCardValue('tipoOrigem');
	var tipoDestino = hAPI.getCardValue('geraMovimento');
	
	var dataBase = hAPI.getCardValue('dataEmissao');
	var dataEmissao = hAPI.getCardValue('dataEmissao');
	var dataCompetencia = hAPI.getCardValue('dataCompetencia');
	
	var serieMov = hAPI.getCardValue('serieMovimento');
	var numeroMov = hAPI.getCardValue('numMovimento');
	var chaveAcesso = hAPI.getCardValue('chaveAcesso');
	var condicaoPgto = hAPI.getCardValue('condicaoPgto');
	
	var arrMovs = hAPI.getCardValue('arrMovs'); 
	
	var newXml = new String; 
	newXml +="<MovFaturamentoProcParams>";	
		newXml +="<movCopiaFatPar>";		
			newXml +="<CodColigada>" + coligada + "</CodColigada>";
			newXml +="<CodSistema>T</CodSistema>";
			newXml +="<CodTmvDestino>"+ tipoDestino +"</CodTmvDestino>";
			newXml +="<CodTmvOrigem>"+ tipoOrigem +"</CodTmvOrigem>";
			newXml +="<CodUsuario>"+ usuario +"</CodUsuario>";
			newXml +="<IdMov>";
           
	    	var listaMovimento = arrMovs.split(",");
	    	for (i = 0; i < listaMovimento.length; i++) {
	    		newXml +="<int>"+ listaMovimento[i] +"</int>";
    		}
	    	newXml +="</IdMov>";	
			
			newXml +="<dataBase>" + dataBase + "</dataBase>";
			newXml +="<dataEmissao>" + dataEmissao + "</dataEmissao>";
			newXml +="<dataExtra1>" + dataCompetencia + "</dataExtra1>";
			newXml +="<TipoFaturamento>1</TipoFaturamento>";
			newXml +="<efeitoPedidoFatAutomatico>2</efeitoPedidoFatAutomatico>";
			newXml +="<listaMovItemFatAutomatico>";			
			
			var campos   = hAPI.getCardData(processo);
			var contador = campos.keySet().iterator();
	    	var indexes  = 0;
	    	
	    	while (contador.hasNext()) {
	    	    var id = contador.next();
	    	    
	    	    if (id.match(/IDRM___/)) { 
	    	        var campo = campos.get(id);
	    	        var seq   = id.split("___");
	    	        var idmov = hAPI.getCardValue("IDRM___" + seq[1]);
					var nseq = hAPI.getCardValue("NSEQ___" + seq[1]);
					var qtde = hAPI.getCardValue("QTDE___" + seq[1]);

					//if (qtde > 0) {
					if (qtde != 0 && qtde != "") {
						
						var n = qtde.search(".");
						for (x = 0; x < n; x++) {
							qtde = qtde.replace(".","");
						}
						
						//qtde = qtde.replace(",",".");
						
						newXml +="<MovItemFatAutomatico>";
							newXml +="<CodColigada>" + coligada + "</CodColigada>";
							newXml +="<Checked>1</Checked>";
							newXml +="<IdMov>" + idmov + "</IdMov>";
							newXml +="<NSeqItmMov>" + nseq + "</NSeqItmMov>";
							newXml +="<Quantidade>" + qtde + "</Quantidade>";
						newXml +="</MovItemFatAutomatico>";
					}
					else {
						throw "Favor verificar a quantidade a faturar!";
					}
	    	    }	    	    
	    	}
		
			newXml +="</listaMovItemFatAutomatico>";
			newXml +="<serie>" + serieMov + "</serie>";
			newXml +="<numeroMov>" + numeroMov + "</numeroMov>";			
			newXml +="<chaveAcessoNfe>" + chaveAcesso + "</chaveAcessoNfe>";
			newXml +="<realizaBaixaPedido>true</realizaBaixaPedido>";
		newXml +="</movCopiaFatPar>";	
	newXml +="</MovFaturamentoProcParams>";		
	
	 // log.info("XML FATURA = "+newXml);
	
	var c1 = DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
	var constraints = new Array(c1, c2);
	var retorno = DatasetFactory.getDataset("FaturaMovimento", null, constraints, null);
	
	log.info("RETORNO = "+retorno.values[0][1]);

	if (!retorno || retorno == "" || retorno == null) 
	{
		throw "Houve um erro na comunicação com o webservice. Tente novamente!";
	}
	else 
	{
		if (retorno.values[0][0] == "false") 
		{
			throw "Não foi possível baixar a NF. Motivo: "+retorno.values[0][1] +". Favor verificar as informações ou entrar em contato com o administrador do sistema.";
		}
		else
		{
			hAPI.setCardValue("resultadoMsg", retorno.values[0][1]);
			
			var url = 'http://fluig.castilho.com.br:1010';
			var fornecedor = hAPI.getCardValue('codForn') + ' - ' + hAPI.getCardValue('nomeFornecedor');
			var filial = hAPI.getCardValue('filial');
			var valor = hAPI.getCardValue('valorTotal');
	    	
			var documento = hAPI.getCardValue('cpfCnpj');   
	    	var documentoAlterado = hAPI.getCardValue('cnpjTrocaForn');
			
	    	if (documentoAlterado != '') {
	    		documento = documentoAlterado;	    		
	    	}
	    	
    		if (tipoDestino == '1.2.01' && betuminoso) {
				
				var subject = "[FLUIG] NF (Betuminoso) inserida no sistema (1.2.01)";
				var body = "Uma nova NF (refente a materiais Betuminosos) foi inserida no sistema.";
				
				var param = new java.util.HashMap();
				param.put("SERVER_URL", url);
				param.put("subject", subject);
				param.put("TENANT_ID", 1);
				param.put("MENSAGEM", body);
				param.put("COLIGADA", coligada);	
			    param.put("FILIAL", filial);
			    param.put("FORNECEDOR", fornecedor);
			    param.put("DOCUMENTO", documento);
			    param.put("DATAEMISSAO",dataEmissao);
			    param.put("NUMNF",numeroMov);
			    param.put("SERIENF",serieMov);
			    param.put("VALOR",valor);
			    param.put("USUARIO",usuario);
				param.put("URL",url+'/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID='+processo);
		    
			var destinatarios = new java.util.ArrayList();
				destinatarios.add('nfmaterialbetuminoso@castilho.com.br');
			
			var anexos = new java.util.ArrayList();
		    var docs = hAPI.listAttachments();
		    for (var i = 0; i < docs.size(); i++) {
		        var doc = docs.get(i);
		        var anexo = new java.util.HashMap();
		        anexo.put("link", fluigAPI.getDocumentService().getDownloadURL(doc.getDocumentId()));
		        anexo.put("description", doc.getDocumentDescription());
		        
		        anexos.add(anexo);
		    }
		    
		    param.put("anexos", anexos);
				
		    notifier.notify("FLUIG", "TPL_NF_BETUMINOSO", param, destinatarios, "text/html");	
				
			}
			
			if (tipoDestino == '1.2.24') {
			
				var subject = "[FLUIG] NF inserida no sistema (1.2.24)";
				var body = "Uma nova NF (sem chave de acesso) foi inserida no sistema.";
				
		    	var param = new java.util.HashMap();
					param.put("SERVER_URL", url);
					param.put("subject", subject);
					param.put("TENANT_ID", 1);
					param.put("MENSAGEM", body);
					param.put("COLIGADA", coligada);	
				    param.put("FILIAL", filial);
				    param.put("FORNECEDOR", fornecedor);
				    param.put("DOCUMENTO", documento);
				    param.put("DATAEMISSAO",dataEmissao);
				    param.put("NUMNF",numeroMov);
				    param.put("SERIENF",serieMov);
				    param.put("VALOR",valor);
				    param.put("USUARIO",usuario);
					param.put("URL",url+'/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID='+processo);
			    
				var destinatarios = new java.util.ArrayList();
					destinatarios.add('contabilidade@castilho.com.br');
				
				var anexos = new java.util.ArrayList();
			    var docs = hAPI.listAttachments();
			    for (var i = 0; i < docs.size(); i++) {
			        var doc = docs.get(i);
			        var anexo = new java.util.HashMap();
			        anexo.put("link", fluigAPI.getDocumentService().getDownloadURL(doc.getDocumentId()));
			        anexo.put("description", doc.getDocumentDescription());
			        
			        anexos.add(anexo);
			    }
			    
			    param.put("anexos", anexos);
					
			    notifier.notify("FLUIG", "TPL_NF_CONTABIL", param, destinatarios, "text/html");	
			}
		}
	}
}
function atualizaMovimento(){
	
	var processo = getValue("WKNumProces");
	var usuario = hAPI.getCardValue('usuario');
	var coligada = hAPI.getCardValue('coligada');
	var condicaoPgto = hAPI.getCardValue('condicaoPgto');
	var formaPgto = hAPI.getCardValue('formaPgto');
	
	var newXml = new String; 
	var arrMovs = hAPI.getCardValue('arrMovs'); 
	var listaMovimento = arrMovs.split(",");
	
	newXml +="<MovMovimento>";	
	
	for (i = 0; i < listaMovimento.length; i++) {
		
		var idmov = listaMovimento[i];
		
		newXml +="<TMOV>";		
			newXml +="<CODCOLIGADA>" + coligada + "</CODCOLIGADA>";
			newXml +="<IDMOV>"+ idmov +"</IDMOV>";
			newXml +="<CODCPG>"+ condicaoPgto +"</CODCPG>";
			newXml +="<CODTB1FLX>"+ formaPgto +"</CODTB1FLX>";
		newXml +="</TMOV>";		
		
	}
	
	newXml +="</MovMovimento>";	
	
	var c1 = DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
	var constraints = new Array(c1, c2);
	var retorno = DatasetFactory.getDataset("AtualizaMovimento", null, constraints, null);

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
function atualizaLancamento(){
	
	var processo = getValue("WKNumProces");
	var usuario = hAPI.getCardValue('usuario');
	var coligada = hAPI.getCardValue('coligada');
	var formPag = hAPI.getCardValue('codFormPgto'); 
	var campos   = hAPI.getCardData(processo);
	var contador = campos.keySet().iterator();
	var indexes  = 0;
	var ret = false;

	while (contador.hasNext()) {
	    var id = contador.next();
	     
	    if (id.match(/IDLAN___/)) { 
	        var campo = campos.get(id);
	        var seq   = id.split("___");
	        var idlan = hAPI.getCardValue("IDLAN___" + seq[1]);
			var dataVenc = hAPI.getCardValue("DATAVENC___" + seq[1]);
			var dataPrevBaixa = hAPI.getCardValue("DATAPREV___" + seq[1]);
			var codigo = hAPI.getCardValue("CODIGOBARRA___" + seq[1]);
			var tamCod = codigo.length();
						
			var newXml = new String;
			newXml +="<FinLAN>";	
			newXml +="<FLAN>";		
				newXml +="<CODCOLIGADA>" + coligada + "</CODCOLIGADA>";
				newXml +="<IDLAN>"+ idlan +"</IDLAN>";
				newXml +="<DATAVENCIMENTO>"+ dataVenc +"</DATAVENCIMENTO>";
				newXml +="<DATAPREVBAIXA>"+ dataPrevBaixa +"</DATAPREVBAIXA>";
			
				if (formPag == '001') {	
				
					if (tamCod == 44) {			
						newXml +="<CODIGOBARRA>"+ codigo +"</CODIGOBARRA>";
					} 
					if (tamCod >= 47) {
						newXml +="<IPTE>"+ codigo +"</IPTE>";
					}
					
				}
			
				newXml +="<USUARIO>"+ usuario +"</USUARIO>";
			newXml +="</FLAN>";
			newXml +="</FinLAN>";	
	
			log.info("XML ATUALIZA = "+newXml);
		
		    var c1 = DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST);
		    var c2 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
		    var c3 = DatasetFactory.createConstraint("pUserRM", usuario, usuario, ConstraintType.MUST);
		    var constraints = new Array(c1, c2, c3);
		    var retorno = DatasetFactory.getDataset("AtualizaLanFinanceiro", null, constraints, null);
		
		    log.info("RETORNO = "+retorno.values[0][1]);
	
		    if (!retorno || retorno == "" || retorno == null) 
		    {
		    	throw "Houve um erro na comunicação com o webservice. Tente novamente!";
		    	ret = false;
		    }
		    else if (retorno.values[0][0] == "false") 
	    	{
	    		throw "Não foi possível atualizar o lançamento. Motivo: "+retorno.values[0][1] +". Favor verificar as informações ou entrar em contato com o administrador do sistema.";
	    		ret = false;
			}
			else
			{
				ret = true;
				hAPI.setCardValue("resultadoMsg", retorno.values[0][1]);
			}
	    }
	}
	return ret;
}
function atualizaDadosPagFornecedor(){
	
	var usuario = hAPI.getCardValue('usuario');
	var coligada = hAPI.getCardValue('coligada');
	var codColForn = hAPI.getCardValue('codColForn');
	var codForn = hAPI.getCardValue('codForn');
	var idPagForn = hAPI.getCardValue('idPagForn');
	var descricaoPag = hAPI.getCardValue('descricaoPag');
	var bancoPag = hAPI.getCardValue('bancoPag');
	var agenciaPag = hAPI.getCardValue('agenciaPag');
	var digAgenciaPag = hAPI.getCardValue('digAgenciaPag');
	var contaPag = hAPI.getCardValue('contaPag');
	var digContaPag = hAPI.getCardValue('digContaPag');
	var favorecidoPag = hAPI.getCardValue('favorecidoPag');
	favorecidoPag = favorecidoPag.split("&").join("&amp;");

	var cpfCnpjPag = hAPI.getCardValue('cpfCnpjPag');	
	var tipoPag = hAPI.getCardValue('tipoPag');
	
	var newXml = new String;
	newXml +="<FinDadosPgtoBR>";	
		newXml +="<FDadosPgto>";
			newXml +="<CODCOLIGADA>" + coligada + "</CODCOLIGADA>";
			newXml +="<CODCOLCFO>" + codColForn + "</CODCOLCFO>";
			newXml +="<CODCFO>"+ codForn +"</CODCFO>";
			newXml +="<FORMAPAGAMENTO>T</FORMAPAGAMENTO>";
			newXml +="<IDPGTO>"+ idPagForn +"</IDPGTO>";
			newXml +="<DESCRICAO>"+ descricaoPag +"</DESCRICAO>";
			newXml +="<NUMEROBANCO>"+ bancoPag +"</NUMEROBANCO>";
			newXml +="<CODIGOAGENCIA>"+ agenciaPag +"</CODIGOAGENCIA>";
			newXml +="<DIGITOAGENCIA>"+ digAgenciaPag +"</DIGITOAGENCIA>";
			newXml +="<CONTACORRENTE>"+ contaPag +"</CONTACORRENTE>";
			newXml +="<DIGITOCONTA>"+ digContaPag +"</DIGITOCONTA>";
			newXml +="<FAVORECIDO>"+ favorecidoPag +"</FAVORECIDO>";
			newXml +="<CGCFAVORECIDO>"+ cpfCnpjPag +"</CGCFAVORECIDO>";
			newXml +="<TIPOCONTA>"+ tipoPag +"</TIPOCONTA>";
			newXml +="<ATIVO>1</ATIVO>";
		newXml +="</FDadosPgto>";
	newXml +="</FinDadosPgtoBR>";	
	
	// log.info("XML ATUALIZA DADOS PAG = "+newXml);
	
    var c1 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("pCodcoligada", coligada, coligada, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("pUsuarioExec", usuario, usuario, ConstraintType.MUST);
    var constraints = new Array(c1,c2,c3);
    var retorno = DatasetFactory.getDataset("AtualizaDadosPagFornec", null, constraints, null);

    log.info("RETORNO = "+retorno.values[0][1]);

    if (!retorno || retorno == "" || retorno == null) 
    {
    	throw "Houve um erro na comunicação com o webservice. Tente novamente!";
    }
    else if (retorno.values[0][0] == "false") 
	{
		throw "Não foi possível atualizar o lançamento. Motivo: "+retorno.values[0][1] +". Favor verificar as informações ou entrar em contato com o administrador do sistema.";
	}
	else
	{
		hAPI.setCardValue("resultadoMsg", retorno.values[0][1]);
	}
	
}
function atualizaParcelas(){

	var processo = getValue("WKNumProces");
	var usuario = hAPI.getCardValue('usuario');
	var coligada = hAPI.getCardValue('coligada');
	var campos   = hAPI.getCardData(processo);
	var contador = campos.keySet().iterator();
	var indexes  = 0;
	
	var newXml = new String;
	newXml +="<MovAlterarValorLancamentoProcParams>";	
		newXml +="<Lancamentos>";

	while (contador.hasNext()) {
	    var id = contador.next();
	     
	    if (id.match(/IDLAN___/)) { 
	        var campo = campos.get(id);
	        var seq   = id.split("___");
	        var idlan = hAPI.getCardValue("IDLAN___" + seq[1]);
			var valor = hAPI.getCardValue("VALOR___" + seq[1]);
						
			newXml +="<MovAlterarValorLancamento>";	
				newXml +="<CODCOLIGADA>" + coligada + "</CODCOLIGADA>";
				newXml +="<CODUSUARIO>" + usuario + "</CODUSUARIO>";
				newXml +="<IDLAN>"+ idlan +"</IDLAN>";
				newXml +="<IDMOV>0</IDMOV>";
				newXml +="<VALORORIGINAL>"+ valor +"</VALORORIGINAL>";
			newXml +="</MovAlterarValorLancamento>";	
	    }
	}
	
		newXml +="</Lancamentos>";
	newXml +="</MovAlterarValorLancamentoProcParams>";	
	
	// log.info("XML ATUALIZA PARCELAS = "+newXml);
	
    var c1 = DatasetFactory.createConstraint("pXML", newXml, newXml, ConstraintType.MUST);
    var constraints = new Array(c1);
    var retorno = DatasetFactory.getDataset("AlteraValorLancamento", null, constraints, null);

    log.info("RETORNO = "+retorno.values[0][1]);

    if (!retorno || retorno == "" || retorno == null) 
    {
    	throw "Houve um erro na comunicação com o webservice. Tente novamente!";
    }
    else if (retorno.values[0][0] == "false") 
	{
		throw "Não foi possível atualizar o lançamento. Motivo: "+retorno.values[0][1] +". Favor verificar as informações ou entrar em contato com o administrador do sistema.";
	}
	else
	{
		hAPI.setCardValue("resultadoMsg", retorno.values[0][1]);
	}
	
}
function verificaManifesto(){

	var codColigada = hAPI.getCardValue('coligada');
	var codColForn = hAPI.getCardValue('codColForn');
	var codForn = hAPI.getCardValue('codTrocaForn');
	var codFilial = hAPI.getCardValue('filial');
	var numeroNota = hAPI.getCardValue('numMovimento');
		
	var c1 = DatasetFactory.createConstraint("pColigada", codColigada, codColigada, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pCodColForn", codColForn, codColForn, ConstraintType.MUST);
	var c3 = DatasetFactory.createConstraint("pCodForn", codForn, codForn, ConstraintType.MUST);	
	var c4 = DatasetFactory.createConstraint("pCodFilial", codFilial, codFilial, ConstraintType.MUST);
	var c5 = DatasetFactory.createConstraint("pNumeroNota", numeroNota, numeroNota, ConstraintType.MUST);
    var constraints = new Array(c1,c2,c3,c4,c5);
    var retorno = DatasetFactory.getDataset("VerificaNFManifesto", null, constraints, null);
    
    if (!retorno || retorno == "" || retorno == null) 
	{
		throw "Houve um erro na comunicação com o servidor. Tente novamente!";
	}
	else 
	{
		var qtde = retorno.values[0][0];
		log.info(qtde);
		
		if (qtde >= 1) {
			
			var url = 'http://fluig.castilho.com.br:1010';
			var processo = getValue("WKNumProces");
			var fornecedor = codForn + ' - ' + hAPI.getCardValue('nomeFornecedor');
			var nomeColigada = hAPI.getCardValue('nomeColigada');
			var usuario = hAPI.getCardValue('usuario');			
			var dataEmissao = hAPI.getCardValue('dataEmissao');			
			var serieMov = hAPI.getCardValue('serieMovimento');
			var chaveAcesso = hAPI.getCardValue('chaveAcesso');
			var valor = hAPI.getCardValue('valorTotal');
			var documento = hAPI.getCardValue('cpfCnpj');   
	    	var documentoAlterado = hAPI.getCardValue('cnpjTrocaForn');
	    	
	    	if (documentoAlterado != '') {
	    		documento = documentoAlterado;	    		
	    	}
			
			var subject = "[FLUIG] NF CANCELADA";
			var body = "Tentativa de inclusão de NF cancelada no sistema.";
			
	    	var param = new java.util.HashMap();
				param.put("SERVER_URL", url);
				param.put("subject", subject);
				param.put("TENANT_ID", 1);
				param.put("MENSAGEM", body);
				param.put("COLIGADA", nomeColigada);	
			    param.put("FILIAL", codFilial);
			    param.put("FORNECEDOR", fornecedor);
			    param.put("DOCUMENTO", documento);
			    param.put("CHAVEACESSO", chaveAcesso);
			    param.put("DATAEMISSAO",dataEmissao);
			    param.put("NUMNF",numeroNota);
			    param.put("SERIENF",serieMov);
			    param.put("VALOR",valor);
			    param.put("USUARIO",usuario);
				param.put("URL",url+'/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID='+processo);
		    
			var destinatarios = new java.util.ArrayList();
				destinatarios.add('contabilidade@castilho.com.br');
				destinatarios.add('diogo.franca@castilho.com.br');	
				
		    notifier.notify("FLUIG", "TPL_NF_CANCELADA", param, destinatarios, "text/html");	
			
		    throw "Nota Fiscal já se encontra cancelada! Por favor entre em contato com a contabilidade.";
		}
	}
	
}
function FormataMoeda(valor){
    
	var numero = parseFloat(valor);
    numero = numero.toFixed(2).split('.');
    numero[0] = "R$ " + numero[0].split(/(?=(?:...)*$)/).join('.');
    return numero.join(',');
}