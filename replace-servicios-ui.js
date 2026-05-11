const fs = require('fs');
let code = fs.readFileSync('src/components/public/Servicios.tsx', 'utf8');

const OLD_GRID_START = `          {/* Grid de cards */}`;
const OLD_GRID_END = `</motion.div>`;
// We will replace everything from {/_ Grid de cards _/} up to the next </div> under </motion.div> (which is the CTA)
// Actually we can use regex to replace it.

const newLayout = `
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
                      <ServiceCard key={service.id} service={service} index={i} onClick={() => setSelected({ ...service, index: i })} />
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
                    <ServiceCard key={service.id} service={service} index={i} onClick={() => setSelected({ ...service, index: i })} />
                  ))}
                </motion.div>
              </div>
            )}
          </div>
`;

// Extract existing card and build a helper component logic.
// We'll just replace the JSX body of Servicios.

fs.writeFileSync('replace-servicios-ui.js', 'done');
