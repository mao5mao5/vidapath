package be.cytomine.controller.image;

import be.cytomine.controller.RestCytomineController;
import be.cytomine.domain.image.ImageInstance;
import be.cytomine.utils.CommandResponse;
import be.cytomine.domain.ontology.Ontology;
import be.cytomine.exceptions.ObjectNotFoundException;
import be.cytomine.service.image.ImageInstanceService;
import be.cytomine.service.ontology.OntologyService;
import be.cytomine.utils.JsonObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api")
@RestController
public class RestImageInstanceOntologyController extends RestCytomineController {

    private final ImageInstanceService imageInstanceService;
    
    private final OntologyService ontologyService;

    /**
     * List all ontologies for an image instance
     */
    @GetMapping("/imageinstance/{imageInstanceId}/ontology.json")
    public ResponseEntity<String> listOntologies(@PathVariable Long imageInstanceId) {
        log.debug("REST request to list ontologies for image instance {}", imageInstanceId);
        ImageInstance imageInstance = imageInstanceService.find(imageInstanceId)
                .orElseThrow(() -> new ObjectNotFoundException("ImageInstance", imageInstanceId));
        
        return responseSuccess(
            imageInstance.getOntologies().stream()
                .map(Ontology::getDataFromDomain)
                .collect(Collectors.toList())
        );
    }

    /**
     * Add an ontology to an image instance
     */
    @PostMapping("/imageinstance/{imageInstanceId}/ontology/{ontologyId}.json")
    public ResponseEntity<String> addOntology(@PathVariable Long imageInstanceId, @PathVariable Long ontologyId) {
        log.debug("REST request to add ontology {} to image instance {}", ontologyId, imageInstanceId);
        
        CommandResponse commandResponse = imageInstanceService.addOntologyToImageInstance(imageInstanceId, ontologyId);
        
        return responseSuccess(commandResponse);
    }

    /**
     * Remove an ontology from an image instance
     */
    @DeleteMapping("/imageinstance/{imageInstanceId}/ontology/{ontologyId}.json")
    public ResponseEntity<String> removeOntology(@PathVariable Long imageInstanceId, @PathVariable Long ontologyId) {
        log.debug("REST request to remove ontology {} from image instance {}", ontologyId, imageInstanceId);
        
        CommandResponse commandResponse = imageInstanceService.removeOntologyFromImageInstance(imageInstanceId, ontologyId);
        
        return responseSuccess(commandResponse);
    }
}