var stati = ["State (Workflow Hazard)","State (Workflow Contromisura)","State (Workflow Requisito sistema)","State (Workflow Requisito sottosistema)","State (Workflow Requisito software)","State (Workflow Requisito hardware)"];
var initialize = true;

function version()
{
	window.alert("prova 79");
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
var type = "";
var modified = "";

function isequal(string)
{
	return string == equal;
}

function updateStatus(item,string)
{
	item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"] = string;
	modified = string;
	numChanged++;
	idChanged.push(parseInt(item.values[RM.Data.Attributes.IDENTIFIER]));
	urlChanged.push(item.ref.toUri());
	toSave.push(item);
}

function updateReqStatus(item)
{
	return new Promise(resolve1 => {
		$("#result").empty();
		println("Aggiornamento status requisiti...","result");
		var linkedStat = [];
		//window.alert("opening: " + item.values[RM.Data.Attributes.IDENTIFIER]);
		RM.Data.getLinkedArtifacts(item.ref, function(linksResult) {
			var artifactIndex = [];
			linksResult.data.artifactLinks.forEach(function(linkDefinition) {
			linkDefinition.targets.forEach(function(ref) {
				indexArtifact(artifactIndex, ref);
				});
			});
			//window.alert("link number: " + artifactIndex.length);
			RM.Data.getAttributes(artifactIndex, [RM.Data.Attributes.IDENTIFIER, RM.Data.Attributes.ARTIFACT_TYPE,"Esito"], function(attrResult) {
				//window.alert("length: " + attrResult.data.length);
				for(item2 of attrResult.data)
				{
					var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
					//window.alert("Linked type: " + linkedtype);
					if (linkedtype == "Test")
					{
						//window.alert("Req : " + item2.values["Esito"]);
						linkedStat.push(item2.values["Esito"]);
					}
				}
				equal = "Passato";
				if(linkedStat.length > 0 && linkedStat.every(isequal) && (item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"] == "Obsoleto" || item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"] == "Propagato" || ((linkedtype == "Requisito software" || linkedtype == "Requisito hardware") && item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"] == "Caratterizzato")))
				{
					window.alert("modified " + item.values[RM.Data.Attributes.IDENTIFIER]);
					updateStatus(item,"Validato");
				}
				if (toSave.length > 0)
				{
					println("Salvataggio in corso...","result");
					RM.Data.setAttributes(toSave, function(result2){
						if(result2.code !== RM.OperationResult.OPERATION_OK)
						{
							window.alert("Error: " + result2.code);
						}
						window.alert("requisito salvato come : " + item.values["State (Workflow " + item.values[RM.Data.Attributes.ARTIFACT_TYPE].name + ")"]);
						toSave = [];
						resolve1("save");
					});
				}
				else resolve1("save");
				println("Completato","result");
				//window.alert("resolved");
			});
		});
	});
}

async function updateCmStatus(item)
{
return new Promise(resolve2 => {
	var linkedStat = [];
	window.alert("opening: " + item.values[RM.Data.Attributes.IDENTIFIER]);
	RM.Data.getLinkedArtifacts(item.ref, async function(linksResult) {
		var artifactIndex = [];
		linksResult.data.artifactLinks.forEach(function(linkDefinition) {
		linkDefinition.targets.forEach(function(ref) {
			indexArtifact(artifactIndex, ref);
			});
		});
		window.alert("link number: " + artifactIndex.length);
		RM.Data.getAttributes(artifactIndex, [RM.Data.Attributes.IDENTIFIER, RM.Data.Attributes.ARTIFACT_TYPE,"State (Workflow Requisito sistema)","State (Workflow Requisito sottosistema)","State (Workflow Requisito software)","State (Workflow Requisito hardware)"], async function(attrResult) {
			window.alert("length: " + attrResult.data.length);
			for(item2 of attrResult.data)
			{
				var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				window.alert("Linked type: " + linkedtype);
				window.alert("stato iniziale : " + item2.values["State (Workflow " + linkedtype + ")"]);
				if (linkedtype.startsWith("Requisito ") && linkedtype != "Requisito input")
				{
					await updateReqStatus(item2);
					$("#result").empty();
					println("Aggiornamento status contromisure...","result");
					window.alert("stato finale : " + item2.values["State (Workflow " + linkedtype + ")"]);
					linkedStat.push(item2.values["State (Workflow " + linkedtype + ")"]);
				}
			}
			equal = "Validato";
			if(linkedStat.length > 0 && linkedStat.every(isequal) && item.values["State (Workflow Contromisura)"] == "Coperto")
			{
				updateStatus(item,"Chiuso");
			}
			else if(linkedStat.length > 0)
			{
				updateStatus(item,"Coperto");
			}
			if (toSave.length > 0)
			{
				println("Salvataggio in corso...","result");
				RM.Data.setAttributes(toSave, function(result2){
					if(result2.code !== RM.OperationResult.OPERATION_OK)
					{
						window.alert("Error: " + result2.code);
					}
					toSave = [];
					resolve2();
				});
			}
			else resolve2();
			println("Completato","result");
			window.alert("resolved");
		});
	});
});
}

async function updateHzStatus(item)
{
	var linkedStat = [];
	RM.Data.getLinkedArtifacts(item.ref, async function(linksResult) {
		var artifactIndex = [];
		linksResult.data.artifactLinks.forEach(function(linkDefinition) {
		linkDefinition.targets.forEach(function(ref) {
			indexArtifact(artifactIndex, ref);
			});
		});
		RM.Data.getAttributes(artifactIndex, [RM.Data.Attributes.IDENTIFIER, RM.Data.Attributes.ARTIFACT_TYPE, "State (Workflow Contromisura)"], async function(attrResult) {
			for(item2 of attrResult.data)
			{
				var linkedtype = item2.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				if (linkedtype == "Contromisura")
				{
					await updateCmStatus(item2);
					$("#result").empty();
					println("Aggiornamento status hazard...","result");
					linkedStat.push(item2.values["State (Workflow Contromisura)"]);
				}
			}
			equal = "Chiuso";
			if(linkedStat.length > 0 && linkedStat.every(isequal) && (item.values["State (Workflow Hazard)"] == "Obsoleto" || item.values["State (Workflow Hazard)"] == "Risolto"))
			{
				updateStatus(item,"Chiuso");
			}
			else if(linkedStat.length > 0)
			{
				updateStatus(item,"Risolto");
			}
			println("Completato","result");
		});
	});
}

$(async function()
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
	
	$("#SetStatus").on("click", async function() {
		RM.Data.getContentsAttributes(selection, stati.concat([RM.Data.Attributes.ARTIFACT_TYPE,RM.Data.Attributes.IDENTIFIER]), async function(result1){
			//window.alert(result1.data.length);
			for(item of result1.data)
			{
				type = item.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				//window.alert("Tipo :" + type);
				if (type.startsWith("Requisito ") && type != "Requisito input")
				{
					var lol = await updateReqStatus(item);
					window.alert(lol);
				}
				else if (type == "Contromisura")
				{
					await updateCmStatus(item);
				}
				else if (type == "Hazard")
				{
					await updateHzStatus(item);
				}
				//window.alert("loop");
			}
			var i;
			var modified = "";
			for(i=0;i<idChanged.length;i++)
			{
				modified = modified + "</br><a href=\"" + urlChanged[i] + "\" target=\"_blank\">" + idChanged[i] + "</a>";
			}
			$("#result").empty();
			println("I seguenti " + numChanged + " artefatti sono stati aggiornati:" + modified,"result");
			//window.alert(toSave.length);
		});
	});
});
