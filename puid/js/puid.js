var identified_artifacts = ["Condizione applicativa","Contromisura","Hazard","Requisito cliente","Requisito sistema","Requisito software","Requisito sottosistema","Test"];
var identifiers = ["Identificativo Condizione Applicativa","Identificativo Contromisura","Identificativo Hazard","Identificativo UN","Identificativo ERIS","Identificativo Software","Identificativo Sottosistema","Identificativo Test"];
var prefixes = ["xxx_","xxx_","xxx_","xxx_","xxx_","xxx_","xxx_","xxx_"];
var counters = [0,0,0,0,0,0,0,0];
var initialize = true;

function updateCounters()
{
	window.alert("initialization 10");
	//RM.Data.getAttributes(RM.Data, function(result){
	//	for (var i = 0; i < 8; i++)
	//	{
	//	}
	initialize=false;
}

$(function()
{
	if (initialize==true) updateCounters();
	
	var selection = [];
	RM.Event.subscribe(RM.Event.ARTIFACT_SELECTED, function(selected) {
	selection = selected;
	});
			   
	window.alert(selection.length);
	
  $("#SetID").on("click", function() {
	  
      window.alert("start function");
      RM.Data.getAttributes(selection, [RM.Data.Attributes.NAME, RM.Data.Attributes.ARTIFACT_TYPE], function(result){
      
      // Store any required attribute changes here
      var toSave = [];
      window.alert("get attributes");
       // Go through artifact data examining artifact type
      result.data.forEach(function(item){
	      console.log(item.values);
	      console.table(item.values);
         var type = item.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
         window.alert(type);
	      window.alert("format "+item.values[RM.Data.Attributes.FORMAT]);
	      window.alert("description "+item.values[RM.Data.Attributes.DESCRIPTION]);
	      window.alert("container "+item.values[RM.Data.Attributes.CONTAINING_MODULE]);
	      window.alert("testo "+item.values[RM.Data.Attributes.PRIMARY_TEXT]);
	      window.alert("nome "+item.values[RM.Data.Attributes.NAME]);
         var newid = "";
	 var n = -1;
	 for (var i = 0; i < 8; i++)
	 {
		 if(identified_artifacts[i].includes(type)) n=i;
	 }
	// if(n!=-1)
	 //{
	 //   newid = prefixes[i]+counters[i];
	 //   counters[i]++;
         //   item.values[identifiers[i]] = newid;
         //   toSave.push(item);
	 //}
      });
      
      // Perform a bulk save for all changed attributes
      RM.Data.setAttributes(toSave, function(result2){
         if(result2.code !== RM.OperationResult.OPERATION_OK)
         {
            window.alert("Error: " + code);
         }
      });
   });
});
});






