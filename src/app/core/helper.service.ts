import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Injectable()
export class HelperService {

  constructor() {}

  /**
   * Extract error messages and return in array
   * @param errors: Object of errors
   */
  public extractErrorMessages(errors: any) {
    const messages = Array<string>();
    for (let p in errors) {
      if (errors.hasOwnProperty(p)) {
        let message = '';
        if (errors[p].constructor === Array) {
          message = errors[p][0];
        } else {
          message = errors[p];
        }
        messages.push(message);
      }
    }
    return messages;
  }




  /**
   * Custom validator for password match
   * @param passwordKey
   * @param passwordConfirmationKey
   */
  public checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      const passwordInput = group.controls[passwordKey],
          passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({notEquivalent: true});
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
  }

}
