package contest.code_challenge.controller;

import contest.code_challenge.dto.request.BuyerRequestDTO;
import contest.code_challenge.dto.response.BuyerResponseDTO;
import contest.code_challenge.interfaces.IBuyerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/buyers")
@CrossOrigin(origins = "*")
public class BuyerController {

    private final IBuyerService buyerService;

    public BuyerController(IBuyerService buyerService) {
        this.buyerService = buyerService;
    }

    @PostMapping
    public ResponseEntity<BuyerResponseDTO> createBuyer(@Valid @RequestBody BuyerRequestDTO buyerRequest) {
        BuyerResponseDTO response = buyerService.saveBuyer(buyerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
