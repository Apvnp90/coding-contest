package contest.code_challenge.interfaces;

import contest.code_challenge.dto.request.BuyerRequestDTO;
import contest.code_challenge.dto.response.BuyerResponseDTO;

public interface IBuyerService {
    BuyerResponseDTO saveBuyer(BuyerRequestDTO buyerRequest);
}
