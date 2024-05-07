import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsProductCode', async: false })
export class IsProductCode implements ValidatorConstraintInterface {
    validate(val: any, args: ValidationArguments) {
        return (
            (typeof val === 'number' || typeof val === 'string') &&
            /^\d+$/.test(val.toString())
        );
    }

    defaultMessage(args: ValidationArguments) {
        return '($value) must be number or string';
    }
}
