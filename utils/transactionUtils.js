const checkIfNewTransaction = async (OrderModel, orderId) => {
    try {
      const order = await OrderModel.findById(orderId);
      return !order || !order.isPaid;
    } catch (error) {
      console.error('Error checking if new transaction:', error);
      throw error;
    }
  };
  
  export { checkIfNewTransaction };
  