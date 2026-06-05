using FSH.Modules.Organization.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FSH.Modules.Organization.Data.Configurations;

public sealed class UserDepartmentAssignmentConfiguration : IEntityTypeConfiguration<UserDepartmentAssignment>
{
    public void Configure(EntityTypeBuilder<UserDepartmentAssignment> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);
        builder.ToTable("UserDepartmentAssignments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.UserId).IsRequired().HasMaxLength(64);
        builder.Property(x => x.DepartmentId).IsRequired();
        builder.Property(x => x.AssignedBy).HasMaxLength(64);
        builder.HasIndex(x => new { x.UserId, x.DepartmentId }).IsUnique();
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.DepartmentId);
        builder.Ignore(x => x.DomainEvents);
    }
}
