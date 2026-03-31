package contest.code_challenge.controller;

import contest.code_challenge.dto.request.BuyerRequestDTO;
import contest.code_challenge.dto.response.BuyerResponseDTO;
import contest.code_challenge.interfaces.IBuyerService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buyers")
@CrossOrigin(origins = "*")
public class BuyerController {

    private static final Logger logger = LoggerFactory.getLogger(BuyerController.class);
    private final IBuyerService buyerService;

    public BuyerController(IBuyerService buyerService) {
        this.buyerService = buyerService;
    }

    @PostMapping
    public ResponseEntity<BuyerResponseDTO> createBuyer(@Valid @RequestBody BuyerRequestDTO buyerRequest) {
        logger.info("Creating buyer: {} {}", buyerRequest.getFirstName(), buyerRequest.getLastName());
        BuyerResponseDTO response = buyerService.saveBuyer(buyerRequest);
        logger.info("Buyer created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
