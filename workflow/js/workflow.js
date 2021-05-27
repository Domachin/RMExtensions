var initialize = true;

//result deve dare la lista degli aggiornati (anche se è lunga)
function version()
{
	window.alert("prova 3");
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
	//if (initialize==true) version();
	
	var selection = [];
	var docName = "";
	println("Entrare in un modulo per aggiornare gli status","intro");
	RM.Event.subscribe(RM.Event.ARTIFACT_OPENED, function(selected) {
		$("#result").empty();
		selection = selected;
		RM.Data.getAttributes(selection, [RM.Data.Attributes.NAME,RM.Data.Attributes.FORMAT], function(result){			
			result.data.forEach(function(item){
				if (item4.values[RM.Data.Attributes.FORMAT] === RM.Data.Formats.MODULE)
				{
					$("#intro").empty();
					println("Modulo: <b>"+item.values[RM.Data.Attributes.NAME]+"</b><br/><br/>Se si effettuano modifiche, uscire e rientrare nel modulo prima di ricalcolare.","intro");
					docName=item.values[RM.Data.Attributes.NAME]+"_";
				}
			});
		});
	});
	
	$("#SetStatus").on("click", function() {
		RM.Data.getAttributes(selection, function(result1){
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
      			});
			$("#result").empty();
			var modified = "";
			idChanged.forEach(function(i){
				modified = "\n" + i;
			});
			println("I seguenti " + numChanged + "artefatti sono stati aggiornati:" + modified,"result");
		});
	});
}
  
  
//---------------------------------------------------------------------------------------------------------------------------------------
		RM.Data.getAttributes(selection, function(result1){
			result1.data.forEach(function(item1){
				var type = item.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
				if (allowedTypes.includes(type))
				{
					stati.push(item.values["State (Workflow "+type+")"]);
					linked.push(item.values["State (Workflow "+type+")"]);
				}
				
				var oldid = item3.values[identifiers[i]];
				var num = 0;
				//window.alert(oldid+" "+prefixes[i]);
				if (oldid==undefined) oldid="";
				try
				{
					num=parseInt(oldid.match(/\d+$/)[0]);
				}
				catch(err)
				{}
				//window.alert("counter "+counters[i]+" num "+num);
				if(isNaN(num)) {}
				else if (num>counters[i]) counters[i]=num;
			});
		});
		
		RM.Data.getAttributes(selection, [RM.Data.Attributes.NAME,RM.Data.Attributes.FORMAT], function(result4){			
			result4.data.forEach(function(item4){
				if (item4.values[RM.Data.Attributes.FORMAT] === RM.Data.Formats.MODULE)
				{
					$("#intro").empty();
					println("Modulo: <b>"+item4.values[RM.Data.Attributes.NAME]+"</b><br/><br/>Se si effettuano modifiche, uscire e rientrare nel modulo prima di ricalcolare.","intro");
					docName=item4.values[RM.Data.Attributes.NAME]+"_";
				}
			});
		});
	});
	
  $("#SetID").on("click", function() {
	  
      $("#progress").empty();
      $("#progress2").empty();
      println("Attendere...","progress");
      //window.alert("start function");
	  
      RM.Data.getContentsAttributes(selection, identifiers.concat([RM.Data.Attributes.ARTIFACT_TYPE]), function(result){
	      
      if(result.code !== RM.OperationResult.OPERATION_OK)
      {
	 window.alert("Error: " + result.code);
         return;
      }
      
      // Store any required attribute changes here
      var toSave = [];
      //window.alert("get attributes");
      var number=0;
       // Go through artifact data examining artifact type
      $("#progress").empty();
      println("Attendere...","progress2");
      result.data.forEach(function(item){
	 number++;
	 $("#progress").empty();
	 println("Elaborazione: <b>"+number+"/"+result.data.length+"</b>","progress");
	 
         var type = item.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
         //window.alert(type);
         var newid = "";
	 var n = -1;
	 for (var i = 0; i < counters.length; i++)
	 {
		 //window.alert(identified_artifacts[i]+" vs "+type);
		 if(identified_artifacts[i].includes(type)) n=i; //window.alert("found: "+i);
	 }
	 if(n!=-1)
	 {
	    var progressive="";
            if (item.values[identifiers[n]]==null || !(item.values[identifiers[n]].includes(prefixes[n]+docName) && item.values[identifiers[n]].length>(prefixes[n].length+docName.length)))
	    {
		var counter = "";
		try
	    	{
			progressive=('0000'+item.values[identifiers[n]].match(/\d+$/)[0]).slice(-Math.max(4,item.values[identifiers[n]].match(/\d+$/)[0].length));
	    	}
	    	catch(error)
	    	{
			counter=counters[n]+1;
			progressive=('0000'+counter).slice(-4);
			counters[n]++;
	    	}
		newid = prefixes[n]+docName+progressive;
	    	//window.alert(newid);
	    	item.values[identifiers[n]] = newid;
            	toSave.push(item);
	    }
	 }
      });
      // Perform a bulk save for all changed attributes
      var number2=0;
      RM.Data.setAttributes(toSave, function(result2){
	 result2.data.forEach(function(item2){
		 number2++;
		 $("#progress2").empty();
		 println("Salvataggio: <b>"+number2+"/"+result2.data.length+"</b>","progress2");
		 
	 });
         if(result2.code !== RM.OperationResult.OPERATION_OK)
         {
            window.alert("Error: " + result2.code);
         }
      println("FINITO","progress2");
      });
   });
});
 $("#RemoveID").on("click", function() {
	  
      $("#progress").empty();
      $("#progress2").empty();
      println("Attendere...","progress");
      //window.alert("start function");
	  
      RM.Data.getContentsAttributes(selection, identifiers.concat([RM.Data.Attributes.ARTIFACT_TYPE]), function(result){
	      
      if(result.code !== RM.OperationResult.OPERATION_OK)
      {
	 window.alert("Error: " + result.code);
         return;
      }
      
      // Store any required attribute changes here
      var toSave = [];
      //window.alert("get attributes");
      var number=0;
       // Go through artifact data examining artifact type
      $("#progress").empty();
      
      if (window.confirm("ATTENZIONE: Sei sicuro di voler cancellare gli identificativi?")){
      println("Attendere...","progress2");
      result.data.forEach(function(item){
	 number++;
	 $("#progress").empty();
	 println("Elaborazione: <b>"+number+"/"+result.data.length+"</b>","progress");
	 
         var type = item.values[RM.Data.Attributes.ARTIFACT_TYPE].name;
         //window.alert(type);
	 var n = -1;
	 for (var i = 0; i < counters.length; i++)
	 {
		 //window.alert(identified_artifacts[i]+" vs "+type);
		 if(identified_artifacts[i].includes(type)) n=i; //window.alert("found: "+i);
	 }
	 if(n!=-1)
	 {
	    	item.values[identifiers[n]] = "";
            	toSave.push(item);
	 }
      });
      // Perform a bulk save for all changed attributes
      var number2=0;
      RM.Data.setAttributes(toSave, function(result2){
	 result2.data.forEach(function(item2){
		 number2++;
		 $("#progress2").empty();
		 println("Salvataggio: <b>"+number2+"/"+result2.data.length+"</b>","progress2");
		 
	 });
         if(result2.code !== RM.OperationResult.OPERATION_OK)
         {
            window.alert("Error: " + result2.code);
         }
      println("FINITO","progress2");
      });}
   });
});	 
});






