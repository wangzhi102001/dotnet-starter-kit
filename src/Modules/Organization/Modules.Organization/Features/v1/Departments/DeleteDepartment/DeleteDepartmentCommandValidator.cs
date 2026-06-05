using FluentValidation;
using FSH.Modules.Organization.Contracts.v1.Departments;

namespace FSH.Modules.Organization.Features.v1.Departments.DeleteDepartment;

public sealed class DeleteDepartmentCommandValidator : AbstractValidator<DeleteDepartmentCommand>
{
    public DeleteDepartmentCommandValidator()
    {
        RuleFor(x => x.DepartmentId).NotEmpty();
    }
}
