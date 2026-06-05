namespace FSH.Framework.Core.Domain;

/// <summary>
/// Entities that implement this interface participate in department-level data-scope isolation.
/// The <see cref="OwnerDepartmentId"/> is automatically populated at creation time by the
/// AuditableEntitySaveChangesInterceptor from the current user's primary-department claim,
/// and should NOT be set manually.
/// </summary>
public interface IHasDepartment
{
    string? OwnerDepartmentId { get; set; }
}
