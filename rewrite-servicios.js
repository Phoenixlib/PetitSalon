const fs = require("fs");
const path = "src/components/public/Servicios.tsx";
let content = fs.readFileSync(path, "utf-8");

const startToken = "          {/* Grid de cards */}";
const endToken = "          {/* CTA */}";

const startIndex = content.indexOf(startToken);
const endIndex = content.indexOf(endToken);

if (startIndex !== -1 && endIndex !== -1) {
  const customLayout = `
          <div className="space-y-16">
            {categories.map((category) => {
              if (category.services.length === 0) return null;
              return (
                <div key={category.id}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold mb-2" style={{ color: "var(--ps-text)" }}>{category.name}</h3>
                    {category.description && <p className="text-sm" style={{ color: "var(--ps-text-mid)" }}>{category.description}</p>}
                  </div>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-80px" }}
                  >
                    {category.services.map((service, i) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        index={i}
                        onClick={() => setSelected({ ...service, index: i })}
                      />
                    ))}
                  </motion.div>
                </div>
              );
            })}

            {uncategorizedServices.length > 0 && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-2" style={{ color: "var(--ps-text)" }}>Otros Servicios</h3>
                </div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  variants={container}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-80px" }}
                >
                  {uncategorizedServices.map((service, i) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={i}
                      onClick={() => setSelected({ ...service, index: i })}
                    />
                  ))}
                </motion.div>
              </div>
            )}
          </div>

`;
  
  content = content.substring(0, startIndex) + customLayout + content.substring(endIndex);
  
  // Also append ServiceCard at the end.
  const serviceCardComponent = `

function ServiceCard({ service, index, onClick }: { service: ServiceItem, index: number, onClick: () => void }) {
  return (
    <motion.button
      variants={cardAnim}
      onClick={onClick}
      className="relative rounded-3xl p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300 text-left w-full cursor-pointer"
      style={{
        backgroundColor: CARD_COLORS[index % CARD_COLORS.length],
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
      >
        <div className="w-5 h-5" style={{ color: "var(--ps-text)" }}>
          {SERVICE_ICONS[index % SERVICE_ICONS.length]}
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold leading-snug" style={{ color: "var(--ps-text)" }}>
          {service.name}
        </h3>
        {service.description && (
          <p className="text-sm mt-1 leading-relaxed line-clamp-2" style={{ color: "var(--ps-text-mid)" }}>
            {service.description}
          </p>
        )}
      </div>
      <div className="mt-auto flex items-end justify-between pt-2">
        <div>
          <p className="text-xl font-bold" style={{ color: "var(--ps-text)" }}>
            {formatPrice(service.price)}
          </p>
          <p className="text-xs" style={{ color: "var(--ps-text-mid)" }}>
            {service.duration} min
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: "rgba(255,255,255,0.7)", color: "var(--primary)" }}
        >
          →
        </div>
      </div>
    </motion.button>
  );
}
`;
  
  content += serviceCardComponent;
  fs.writeFileSync(path, content, "utf-8");
  console.log("Servicios.tsx updated");
} else {
  console.log("Not found indexes");
}
