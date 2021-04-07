/*
 Licensed Materials - Property of IBM
 import-repair.js
 © Copyright IBM Corporation 2014

U.S. Government Users Restricted Rights:  Use, duplication or disclosure restricted by GSA ADP Schedule 
Contract with IBM Corp. 
*/

/* Given a module with artifacts containing text content either join selected artifacts together into a 
 * single artifact, or split a single artifact with multiple paragraphs into multiple artifacts in the 
 * module.  It is not recommended to try splitting or joining artifacts with non-text content, artifacts
 * of different types or artifacts at different levels in the module hierarchy, although the extension
 * will make a best effort attempt in those cases.
 * 
 * In the case of the join function the first artifact selected is the one that is preserved and had the
 * text of the other artifacts merged into it.  Once that has occurred, the other artifacts are deleted.
 * 
 * In the case of the split function, the text of the artifact is split along paragraph boundaries and the
 * new artifacts are created after the initial artifact.  The initial artifact is preserved to hold the
 * first paragraph content and new artifacts are created for the subsequent paragraphs.
 * 
 */

var initialize = true;
function version()
{
	window.alert("prova 11");
	initialize=false;
}

/* Helper function for simple output */
function println(string) {
	var p = document.createElement("p");
	p.innerHTML = string;
	$(p).appendTo("#result");
};

/* Creates a single, joined block of text from the RM.Data.Attributes.PRIMARY_TEXT contents of the selected
 * artifacts to send to the server.
 */
function constructJoined(artifactAttributes, attrName) {
	var newText = "";
	var theMax = -1;
	var theMin = -1;
	
	var it = 0
	artifactAttributes.forEach(function(aa) {
		it++;
		var aaText = aa.values[attrName];
		window.alert(it + " old: " + aaText + "new: " + newText);
		var identifier = parseInt(aa.values[RM.Data.Attributes.IDENTIFIER]);
		if (aaText) {
			if(theMax == -1 && theMin == -1) {newText = newText + aaText; theMax = identifier; theMin = identifier;}
			else if(identifier > theMax) {newText = newText + aaText; theMax = identifier;}
			else if(identifier < theMin) {newText = aaText + newText; theMin = identifier;}
			else {newText = newText + aaText;}
			window.alert(newText);
		} else {
			// Error handling
		}
	});
	
	return newText;
};

/* Main Operating Function */

$(function() {
	
	if (initialize==true) version();
	
	// this function is run when the document is ready.
	
	var selection = [];
	
	// Tracks whether or not to update selection messages while an operation is performed.  Otherwise,
	// as the selection changed with the creation or deletion of artifacts the information displayed in
	// the extension would update unnecessarily.
	var operationInProgress = false;
	
	RM.Event.subscribe(RM.Event.ARTIFACT_SELECTED, function(selected) {
		$("#result").empty();
		selection = selected;
		if (!operationInProgress) {
			// Get the name of the initial selected artifact to make it clear what is being operated on.
			RM.Data.getAttributes(selection[0], [RM.Data.Attributes.NAME], function (attrResult) {
				if (attrResult.code === RM.OperationResult.OPERATION_OK) {
					var rootName = attrResult.data[0].values[RM.Data.Attributes.NAME];
					if (selected.length > 1) {
						println((selection.length - 1) + " objects ready to join to: " + rootName);
					} else if (selected.length === 1) {
						println(rootName + " ready to split into component artifacts.")
					}
				} else {
					println("Unable to determine name of root artifact for operation.");
				}
			});
		}
	});
	
	$("#splitArtifact").on("click", function() {
		// Get the necessary information for the split from the initial artifact.
		RM.Data.getAttributes(selection[0], [RM.Data.Attributes.PRIMARY_TEXT, RM.Data.Attributes.ARTIFACT_TYPE,
		                                     RM.Data.Attributes.IS_HEADING], 
				function (attrResult) {
			if (attrResult.code === RM.OperationResult.OPERATION_OK) {
				var artifactAttributes = attrResult.data[0];
				if (artifactAttributes) {
					// retrieve the values we requested
					var existingText = artifactAttributes.values[RM.Data.Attributes.PRIMARY_TEXT];
					var existingType = artifactAttributes.values[RM.Data.Attributes.ARTIFACT_TYPE];
					var isHeading = artifactAttributes.values[RM.Data.Attributes.IS_HEADING];
					// Use regex to split the existing text in the artifact into separate paragraphs.
					var paragraphs = existingText.match(/<p.+<\/p>/gi);
					
					if (paragraphs.length <= 1) {
						println("No paragraph boundaries to split along detected, aborting split operation.");
						return;
					}
					
					println("The artifact will be split into " + paragraphs.length + " artifacts ...");
					operationInProgress = true;
					// Set the content in the first artifact as the first of the split artifacts
					var paragraph = paragraphs.shift();
					var newTextValues = new RM.ArtifactAttributes(selection[0]);
					newTextValues.values[RM.Data.Attributes.PRIMARY_TEXT] = paragraph;
					println("Artifact content is being joined in the first artifact that you selected...");
					RM.Data.setAttributes(newTextValues, function(setResult) {
						if (setResult.code === RM.OperationResult.OPERATION_OK) {
							// Recursive sequence to create the artifacts to hold the newly split paragraphs
							var createSequence = function(previousRef) {
								// Check that we have further paragraphs to continue processing, and also remove
								// the one we are about to process from the list if we do.
								if (paragraph = paragraphs.shift()) {
									// Determine the values to create the new artifact with
									var newValues = new RM.AttributeValues;
									newValues[RM.Data.Attributes.PRIMARY_TEXT] = paragraph;
									newValues[RM.Data.Attributes.ARTIFACT_TYPE] = existingType.name;
									newValues[RM.Data.Attributes.IS_HEADING] = isHeading;
									var strategy = new RM.LocationSpecification(previousRef, 
											RM.Data.PlacementStrategy.AFTER);
									
									RM.Data.Module.createArtifact(newValues, strategy, 
											function(createResult) {
										if (createResult.code === RM.OperationResult.OPERATION_OK) {
											var newRef = createResult.data;
											createSequence(newRef);
										} else {
											println("Unable to create split artifact, aborting split" + 
											" operation.");
											operationInProgress = false;
										}
									});
								} else {
									println("All of the new artifacts were added to the module.");
									println("The artifact was split.");
									operationInProgress = false;
								}
							};
							println("Artifacts are being created as a result of the split...");
							// Start the sequence of creations
							createSequence(selection[0]);
						}
					});
				}
			}
		});
	});
	
	$("#joinArtifacts").on("click", function() {
		RM.Data.getAttributes(selection, function (attrResult) {
			if (attrResult.code === RM.OperationResult.OPERATION_OK) {
				var artifactAttributes = attrResult.data;
				var attrs = attrResult.data[0];
				var keys = [];
				for (var key in attrs.values)
				{
					keys.push(key);
				}
				if (artifactAttributes) {
					window.alert("entering");
					var firstChoice = artifactAttributes.shift();
					var newTextValues = new RM.ArtifactAttributes(firstChoice.ref);
					window.alert("new created");
					RM.Data.getValueRange(selection[0], keys, function (valResult)
					{
						if (valResult.code != RM.OperationResult.OPERATION_OK)
						{
							return;
						}
						for (var i = 0; i < keys.length; i++)
						{
							// Collect the information for each attribute in turn.
							var attrName = valResult.data[i].attributeKey;

							try
							{
								window.alert(attrName);
								var joinedText = constructJoined(artifactAttributes,attrName);					
								newTextValues.values[attrName] = joinedText;
							}
							catch(err) {}

							println("Joining all selected text into first artifact");
							operationInProgress = true;
						}

						// Add the table we have constructed to the attributes section of the gadget.
						$("#attributes").append(table);
					});
					/*for (var i = 0; i < keys.length; i++)
					{
						window.alert(i);
						// Get the text for the joined artifact
						var attrName = attrResult.data[i].attributeKey;
						try
						{
							var joinedText = constructJoined(artifactAttributes,attrName);					
							newTextValues.values[attrName] = joinedText;
							window.alert(attrName);
						}
						catch(err) {}

						println("Joining all selected text into first artifact");
						operationInProgress = true;
					}*/
					RM.Data.setAttributes(newTextValues, function(setResult) {
						if (setResult.code === RM.OperationResult.OPERATION_OK) {
							// Remove the leftover artifacts
							var targetCount = 0;
							// Use a recursive delete function to delete however many artifacts are left
							// over from the join operation, while waiting for each individual deletion
							// to complete before starting the next one
							var removeSequence = function() {
								if (artifactAttributes[targetCount]) {
									RM.Data.Module.removeArtifact(artifactAttributes[targetCount].ref, 
											true, function(removeResult) {
										if (removeResult.code === RM.OperationResult.OPERATION_OK) {
											targetCount++;
											removeSequence();
										} else {
											println("Unable to remove joined artifact, aborting join operation.");
											operationInProgress = false;
										}
									});
								} else {
									println("The first artifact that you selected now contains the contents of " 
											+ "the other selected artifacts. The other artifacts were removed.");
									println("The artifacts were joined.");
									operationInProgress = false;
								}
							};
							println("Removing leftover artifacts after joining their content.");
							// Start the sequence of deletions
							removeSequence();
						} else {
							println("Unable to join content into first artifact, aborting join operation.");
							operationInProgress = false;
						}
					});
				}
			}
		});
	});
	
});