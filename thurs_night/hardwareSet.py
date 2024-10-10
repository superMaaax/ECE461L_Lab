class hardwareSet:

    def __init__(self):
        # all attributes are private
        self.__capacity = 0
        self.__availability = 0
        self.__checked_out = []

    def initialize_capacity(self, qty):
        self.__capacity = qty
        self.__availability = qty
        # making sure it's None and not 0, so we don't confuse it with projectID
        self.__checked_out = [None] * qty

    def get_availability(self):
        return self.__availability

    def get_capacity(self):
        return self.__capacity

    def check_out(self, qty, projectID):
        if qty > self.__availability:
            # allow users to check number of units available then return error
            actual_qty = self.__availability
            for i in range(len(self.__checked_out)):
                if self.__checked_out[i] is None:
                    self.__checked_out[i] = projectID
                    actual_qty -= 1
                if actual_qty == 0:
                    break
            self.__availability = 0
            return -1
        else:
            checked_out_count = 0
            for i in range(len(self.__checked_out)):
                if self.__checked_out[i] is None:
                    # assign project id to the unit
                    self.__checked_out[i] = projectID
                    checked_out_count += 1
                if checked_out_count == qty:
                    break
            self.__availability -= qty
            return 0

    def check_in(self, qty, projectID):
        currently_checked_out = self.__checked_out.count(projectID)
        # if qty is greater than currently checked out or currently checked out is 0, return error
        if qty > currently_checked_out or currently_checked_out == 0:
            return -1
        else:
            checked_in_count = 0
            for i in range(len(self.__checked_out)):
                # match project id and check in
                if self.__checked_out[i] == projectID:
                    self.__checked_out[i] = None
                    checked_in_count += 1
                if checked_in_count == qty:
                    break
            self.__availability += qty
            return 0
