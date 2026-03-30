package contest.code_challenge.services;

import contest.code_challenge.dto.request.BuyerRequestDTO;
import contest.code_challenge.dto.response.BuyerResponseDTO;
import contest.code_challenge.entity.Buyer;
import contest.code_challenge.interfaces.IBuyerService;
import contest.code_challenge.repository.BuyerRepository;
import org.springframework.stereotype.Service;

@Service
public class BuyerService implements IBuyerService {

    private final BuyerRepository buyerRepository;

    public BuyerService(BuyerRepository buyerRepository) {
        this.buyerRepository = buyerRepository;
    }

    @Override
    public BuyerResponseDTO saveBuyer(BuyerRequestDTO buyerRequest) {
        Buyer buyer = new Buyer();
        buyer.setFirstName(buyerRequest.getFirstName());
        buyer.setLastName(buyerRequest.getLastName());
        buyer.setEmail(buyerRequest.getEmail());

        Buyer savedBuyer = buyerRepository.save(buyer);

        return new BuyerResponseDTO(
                savedBuyer.getId(),
                savedBuyer.getFirstName(),
                savedBuyer.getLastName(),
                savedBuyer.getEmail()
        );
    }
}
