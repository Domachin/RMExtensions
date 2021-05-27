var initialize = true;

function version()
{
	window.alert("prova 5");
	initialize=false;
}

function println(string,element) {
	var p = document.createElement("p");
	p.innerHTML = string;
	$(p).appendTo("#"+element);
};

function indexArtifact(/*RM.ArtifactRef[]*/ refs, /*RM.ArtifactRef*/ ref) {
	// Summary: Maintains a non-duplicating array of RM.ArtifactRef objects.
	var refPresent = false;
	for (var i = 0; i < refs.length; i++) {
		if (refs[i].equals(ref)) {
			refPresent = true;
		}
	}
	if (!refPresent) {
		refs.push(ref);
	}
};

var equal = "";
var toSave = [];
var numChanged = 0;
var idChanged = [];
var urlChanged = [];

function isequal(string)
{
	return string == equal;
}

function updateStatus(item,string)
{
	if (item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"] != string)
	{
		item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"] = string;
		numChanged++;
		idChanged.push(parseInt(item.values[RM.Data.Attributes.IDENTIFIER]));
		uriChanged.push(item.ref.toUri());
		toSave.push(item);
	}
}

function updateReqStatus(item)
{
	println("Aggiornamento status requisiti...","result");
	var linkedStat = [];
	RM.Data.getLinkedArtifacts(item, function(linksResult) {
		var artifactIndex = [];
		linksResult.data.artifactLinks.forEach(function(linkDefinition) {
		linkDefinition.targets.forEach(function(ref) {
			indexArtifact(artifactIndex, ref);
			});
		});
		RM.Data.getAttributes(artifactIndex, function(attrResult) {
			attrResult.data.forEach(function(item2){
				var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				if (linkedtype == "Test")
				{
					linkedStat.push(item2.values["Esito"].name);
				}
			});
		});
	});
	equal = "Passato";
	if(linkedStat.length > 0 && linkedStat.every(isequal))
	{
		updateStatus(item,"Validato");
	}
	println("Completato","result");
}

function updateCmStatus(item)
{
	var linkedStat = [];
	RM.Data.getLinkedArtifacts(item, function(linksResult) {
		var artifactIndex = [];
		linksResult.data.artifactLinks.forEach(function(linkDefinition) {
		linkDefinition.targets.forEach(function(ref) {
			indexArtifact(artifactIndex, ref);
			});
		});
		RM.Data.getAttributes(artifactIndex, function(attrResult) {
			attrResult.data.forEach(function(item2){
				var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				if (linkedtype.startsWith("Requisito ") && linkedtype != "Requisito input")
				{
					updateReqStatus(item2);
					println("Aggiornamento status contromisure...","result");
					linkedStat.push(item2.values["State (Workflow " + linkedtype + ")"].name);
				}
			});
		});
	});
	equal = "Validato";
	if(linkedStat.length > 0 && linkedStat.every(isequal))
	{
		updateStatus(item,"Chiuso");
	}
	else if(linkedStat.length > 0)
	{
		updateStatus(item,"Coperto");
	}
	println("Completato","result");
}

function updateHzStatus(item)
{
	var linkedStat = [];
	RM.Data.getLinkedArtifacts(item, function(linksResult) {
		var artifactIndex = [];
		linksResult.data.artifactLinks.forEach(function(linkDefinition) {
		linkDefinition.targets.forEach(function(ref) {
			indexArtifact(artifactIndex, ref);
			});
		});
		RM.Data.getAttributes(artifactIndex, function(attrResult) {
			attrResult.data.forEach(function(item2){
				var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				if (linkedtype == "Contromisura")
				{
					updateCmStatus(item2);
					println("Aggiornamento status hazard...","result");
					linkedStat.push(item2.values["State (Workflow " + linkedtype + ")"].name);
				}
			});
		});
	});
	equal = "Chiuso";
	if(linkedStat.length > 0 && linkedStat.every(isequal))
	{
		updateStatus(item,"Chiuso");
	}
	else if(linkedStat.length > 0)
	{
		updateStatus(item,"Risolto");
	}
	println("Completato","result");
}

$(function()
{
	if (initialize==true) version();
	
	var selection = [];
	var docName = "";
	println("Entrare in un modulo per aggiornare gli status","intro");
	RM.Event.subscribe(RM.Event.ARTIFACT_OPENED, function(selected) {
		$("#result").empty();
		selection = selected;
		RM.Data.getAttributes(selection, [RM.Data.Attributes.NAME,RM.Data.Attributes.FORMAT], function(result){			
			result.data.forEach(function(item){
				if (item.values[RM.Data.Attributes.FORMAT] === RM.Data.Formats.MODULE)
				{
					$("#intro").empty();
					println("Modulo: <b>"+item.values[RM.Data.Attributes.NAME]+"</b><br/><br/>Se si effettuano modifiche, uscire e rientrare nel modulo prima di ricalcolare.","intro");
					docName=item.values[RM.Data.Attributes.NAME]+"_";
				}
			});
		});
	});
	
	$("#SetStatus").on("click", function() {
		println("Azioni in corso:","result");
		RM.Data.getContentsAttributes(selection, function(result1){
			result1.data.forEach(function(item1){
				var type = item1.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				if (type.startsWith("Requisito ") && type != "Requisito input")
				{
					updateReqStatus(item1);
				}
				else if (type == "Contromisura")
				{
					updateCmStatus(item1);
				}
				else if (type == "Hazard")
				{
					updateHzStatus(item1);
				}
			});
			println("Salvataggio in corso...","result");
			RM.Data.setAttributes(toSave, function(result1){
         			if(result1.code !== RM.OperationResult.OPERATION_OK)
         			{
            				window.alert("Error: " + result1.code);
         			}
				var modified = "";
				var i;
				for(i=0;i<idChanged.length;i++)
				{
					modified = modified + "\n" + "<a href=\"" + urlChanged[i] + "\">" + idChanged[i] + "</a>";
				}
				$("#result").empty();
				println("I seguenti " + numChanged + " artefatti sono stati aggiornati:" + modified,"result");
      			});
		});
	});
});
