function validateForm(form) {
	
	var atv = getValue("WKNumState");
	
	// ETAPA: Entrada da NF
	if(atv == 11) {
		
		if (form.getValue("nomeColigada") == null || form.getValue("nomeColigada") == "") {
			throw "Não foi possível consultar a Coligada.";			
		}  
		if (form.getValue("nomeFornecedor") == null || form.getValue("nomeFornecedor") == "") {
			throw "Não foi possível consultar o Fornecedor.";			
		}
		if (form.getValue("formaPgto") == null || form.getValue("formaPgto") == "") {
			throw "Por favor, preencha a Forma de Pagamento.";			
		}
		if (form.getValue("formaPgto") == "009" && form.getValue("bancoPag") == "") {
			throw "Por favor, preencha os dados bancários do Fornecedor.";			
		}
		if (form.getValue("condicaoPgto") == null || form.getValue("condicaoPgto") == "") {
			throw "Por favor, preencha a Condição de Pagamento.";			
		}
		if (form.getValue("dataEmissao") == null || form.getValue("dataEmissao") == "") {
			throw "Por favor, preencha a Data de Emissão.";			
		}  		 
		if (form.getValue("dataCompetencia") == null || form.getValue("dataCompetencia") == "") {
			throw "Por favor, preencha a Data de Competência.";	
		}  
		if (form.getValue("serieMovimento") == null || form.getValue("serieMovimento") == "" || form.getValue("serieMovimento").length < 3) {
			throw "Por favor, preencha a Série da NF.";	
		} 
		if (form.getValue("numMovimento") == null || form.getValue("numMovimento") == "" || form.getValue("numMovimento").length < 9) {
			throw "Por favor, preencha o Número da NF.";	
		} 
		if (form.getValue("geraMovimento") == null || form.getValue("geraMovimento") == "") {
			throw "Por favor, preencha o Tipo do Movimento a ser gerado.";	
		} 		
		if (form.getValue("geraMovimento") != '1.2.24') {
		
			if (form.getValue("chaveAcesso") == null || form.getValue("chaveAcesso") == "") {
				throw "Por favor, preencha a Chave de Acesso da NF.";	
			} 
			
			var chaveAcesso = form.getValue("chaveAcesso");
						
			if (chaveAcesso.length < 44 || chaveAcesso.length > 44 ) {
				throw "Tamanho inválido para a Chave de Acesso.";	
			}
			else {
				var serie = chaveAcesso.substring(22, 25);
				var num = chaveAcesso.substring(25, 34);
				
				if (form.getValue("serieMovimento") != serie) {
					throw "Chave de Acesso inválida para a Série da NF";
				}
				if (form.getValue("numMovimento") != num) {
					throw "Chave de Acesso inválida para o Número da NF";
				}
				
			}
		}
		
		var indexes = form.getChildrenIndexes("tabelaItens");
		var total = 0.00;
		
	    if (indexes.length > 0) {	   	
	        for (var i = 0; i < indexes.length; i++) {         	
	            
	        	total = total + parseFloat(form.getValue('PRECOTOTAL___' + indexes[i]));	            
	            var avaliaProduto = form.getValue('AVALIAPRODUTO___' + indexes[i]);
	            var quantidade = form.getValue('QTDE___' + indexes[i]);
	            //var justificativa = form.getValue('justificativa');
	            
	            var avaliacao = form.getValue('avaliacaoD');
	            
	            if (avaliaProduto == '1' && quantidade != '0' && avaliacao == '') {
	            	throw "A Avaliação do Fornecedor é obrigatória para o(s) produto(s) listados!";
	            }
	        }
	        
	        var totalNota = total.toFixed(2);
	        var limite = parseFloat(form.getValue('total') *1.1).toFixed(2);
	        
	        log.info("TOTAL NOTA"+totalNota);
	        log.info("LIMITE"+limite);
	        
	        if (parseFloat(limite) < parseFloat(totalNota)) {
	    	    
	    	    throw "Valor da Nota Fiscal está acima do limite. Por favor verifique e tente novamente!";
	        }
	    } 
	    
	    
	}
	
	// ETAPA: Financeiro
	if(atv == 14) {
		
		if (form.getValue("codFormPgto") == '001') {
			
			/* VERIFICA PREENCHIMENTO DO CODIGO DE BARRAS */
		    /*var indexes = form.getChildrenIndexes("tabelaLanItens");
		    if (indexes.length > 0) {	
		    	console.log(indexes);
		        for (var i = 0; i < indexes.length; i++) { 	        	
		            if(form.getValue('CODIGOBARRA___' + indexes[i]) == "") {           
		            	throw "Favor preencher o Código de Barras/IPTE.";
		            }
		        }
		    }*/	
		}
		
		var indexes = form.getChildrenIndexes("tabelaLanItens");
		var total = 0.00;
		
	    if (indexes.length > 0) {	   	
	        for (var i = 0; i < indexes.length; i++) {         	
	            
	        	if(form.getValue('DATAVENC___' + indexes[i]) == "") {           
	            	throw "Favor preencher a data de vencimento.";
	            }
	            
	            if(form.getValue('DATAPREV___' + indexes[i]) == "") {           
	            	throw "Favor preencher a data de previsão da baixa.";
	            }
	            
	            if(form.getValue('VALOR___' + indexes[i]) == "") {           
	            	throw "Favor preencher o valor da parcela.";
	            }
	            var parc = form.getValue('VALOR___' + indexes[i]);
	            parc = parc.replace(".","");
	            parc = parc.replace(".","");
	            parc = parc.replace(",",".");
	            total = total + parseFloat(parc);	
	            
	        }
	        
	        var totalNota = parseFloat(total);
	        var limite = form.getValue('total');
	       
	        if (limite != totalNota.toFixed(2)) {	    	    
	    	    throw "A soma das parcelas difere do valor da Nota Fiscal. Por favor, verifique e tente novamente!";	        	
	        }
	    }
		
	}
}