export interface UserDTO {
  firstName: string;
  lastName: string;
  phone: {
    type: string;
    index: true;
    background: true;
  };
}
