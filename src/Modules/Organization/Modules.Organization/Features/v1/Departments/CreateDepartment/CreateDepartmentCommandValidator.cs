using FluentValidation;
using FSH.Modules.Organization.Contracts.v1.Departments;

namespace FSH.Modules.Organization.Features.v1.Departments.CreateDepartment;

public sealed class CreateDepartmentCommandValidator : AbstractValidator<CreateDepartmentCommand>
{
    public CreateDepartmentCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(64);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}
