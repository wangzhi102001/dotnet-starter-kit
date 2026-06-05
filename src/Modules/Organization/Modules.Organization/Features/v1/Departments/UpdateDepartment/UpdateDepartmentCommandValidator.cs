using FluentValidation;
using FSH.Modules.Organization.Contracts.v1.Departments;

namespace FSH.Modules.Organization.Features.v1.Departments.UpdateDepartment;

public sealed class UpdateDepartmentCommandValidator : AbstractValidator<UpdateDepartmentCommand>
{
    public UpdateDepartmentCommandValidator()
    {
        RuleFor(x => x.DepartmentId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(128);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(64);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}
