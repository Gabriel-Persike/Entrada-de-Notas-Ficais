function displayFields(form,customHTML) {
	
	var atividade = getValue('WKNumState');
	form.setHidePrintLink(true);
	
	customHTML.append("<script>var FORM_MODE = '" + form.getFormMode() + "'</script>")
	
	if ( form.getFormMode() == 'MOD' ) {
	
		form.setShowDisabledFields(true);
		form.setValue('condicaoPgto',form.getValue('codPgto') + ' - ' + form.getValue('nomePgto'));
		form.setValue('formaPgto',form.getValue('codFormPgto') + ' - ' + form.getValue('nomeFormPgto'));
		
	}
}