package contest.code_challenge.services;

import contest.code_challenge.dto.request.BuyerRequestDTO;
import contest.code_challenge.dto.response.BuyerResponseDTO;
import contest.code_challenge.entity.Buyer;
import contest.code_challenge.interfaces.IBuyerService;
import contest.code_challenge.repository.BuyerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class BuyerService implements IBuyerService {

    private static final Logger logger = LoggerFactory.getLogger(BuyerService.class);
    private final BuyerRepository buyerRepository;

    public BuyerService(BuyerRepository buyerRepository) {
        this.buyerRepository = buyerRepository;
    }

    @Override
    public BuyerResponseDTO saveBuyer(BuyerRequestDTO buyerRequest) {
        logger.debug("Saving buyer: {}", buyerRequest.getEmail());
        
        Buyer buyer = new Buyer();
        buyer.setFirstName(buyerRequest.getFirstName());
        buyer.setLastName(buyerRequest.getLastName());
        buyer.setEmail(buyerRequest.getEmail());
        buyer.setCity(buyerRequest.getCity());
        buyer.setState(buyerRequest.getState());

        Buyer savedBuyer = buyerRepository.save(buyer);
        logger.info("Buyer saved successfully with ID: {}", savedBuyer.getId());

        return new BuyerResponseDTO(
                savedBuyer.getId(),
                savedBuyer.getFirstName(),
                savedBuyer.getLastName(),
                savedBuyer.getEmail(),
                savedBuyer.getCity(),
                savedBuyer.getState()
        );
    }
}
