class hardwareSet:
    def __init__(self):
        self.capacity = 0
        self.availability = 0
        self.checked_out = []

    def initialize_capacity(self, qty):
        self.capacity = qty
        self.availability = qty
        self.checked_out = [0] * qty
        
    def get_availability(self):
        return self.availability

    def get_capacity(self):
        return self.capacity

    def check_out(self, qty, projectID):
        if projectID >= len(self.checked_out):
            return -1  

        if qty > self.availability:
            qty = self.availability
            error = -1
        else:
            error = 0

        self.checked_out[projectID] += qty
        self.availability -= qty

        return error

    def check_in(self, qty, projectID):
        if projectID >= len(self.checked_out) or qty > self.checked_out[projectID]:
            return -1 

        self.checked_out[projectID] -= qty
        self.availability += qty
        return 0
