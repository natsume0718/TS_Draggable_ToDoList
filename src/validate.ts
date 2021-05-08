namespace App {
  // validation
  export interface Validatable {
    value: number | string,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number
  }

  export function validate(obj: Validatable) {
    let isValid = true;
    if (obj.required) {
      isValid = isValid && obj.value.toString().trim().length !== 0;
    }
    if (obj.minLength !== undefined) {
      if (typeof obj.value === 'number') {
        isValid = isValid && obj.minLength < obj.value
      }
      if (typeof obj.value === 'string') {
        isValid = isValid && obj.minLength < obj.value.length;
      }
    }
    if (obj.maxLength !== undefined) {
      if (typeof obj.value === 'number') {
        isValid = isValid && obj.maxLength > obj.value;
      }
      if (typeof obj.value === 'string') {
        isValid = isValid && obj.maxLength > obj.value.length;
      }
    }

    if (obj.min !== undefined) {
      if (typeof obj.value === 'number') {
        isValid = isValid && obj.min < obj.value;
      }
    }
    if (obj.max !== undefined) {
      if (typeof obj.value === 'number') {
        isValid = isValid && obj.max < obj.value;
      }
    }
    return isValid;
  }
}
