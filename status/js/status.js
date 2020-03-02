var identified_artifacts = ["Condizione applicativa","Contromisura","Hazard","Requisito cliente","Requisito sistema","Requisito software","Requisito sottosistema","Test"];
var identifiers = ["Identificativo Condizione Applicativa","Identificativo Contromisura","Identificativo Hazard","Identificativo UN","Identificativo ERIS","Identificativo Software","Identificativo Sottosistema","Identificativo Test"];
var prefixes = ["xxx_","xxx_","xxx_","xxx_","xxx_","xxx_","xxx_","xxx_"];
var initialize = true;

function updateCounters()
{
	window.alert("init 2");
	initialize=false;
}

$(function()
{
	if (initialize==true) updateCounters();
	
	RM.Event.subscribe(RM.Event.ARTIFACT_SAVED, function(selected) {
		RM.Data.getAttributes(selection, identifiers.concat([RM.Data.Attributes.ARTIFACT_TYPE]), function(result){
			var toSave = [];
			var item = result.data[0];
			var type = item.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
			var status = item.values["State (Workflow "+type+")"];
			var allocation = item.values["Allocazione"];
			window.alert(status+" "+allocation);
			if(status=="Identificato" && allocation!=undefined) item.values["State (Workflow "+type+")"]="Allocato";
			toSave.push(item);
			RM.Data.setAttributes(toSave, function(result2){
         			if(result2.code !== RM.OperationResult.OPERATION_OK)
         			{
            				window.alert("Error: " + code);
         			}
      			});
		});
	});
});
