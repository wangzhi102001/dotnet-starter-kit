using FSH.Modules.Organization.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FSH.Modules.Organization.Data.Configurations;

public sealed class RoleDataScopeConfiguration : IEntityTypeConfiguration<RoleDataScope>
{
    public void Configure(EntityTypeBuilder<RoleDataScope> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);
        builder.ToTable("RoleDataScopes");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.RoleName).IsRequired().HasMaxLength(64);
        builder.Property(x => x.Scope).IsRequired().HasConversion<string>().HasMaxLength(32);
        builder.HasIndex(x => x.RoleName).IsUnique();
        builder.Ignore(x => x.DomainEvents);
    }
}
