import React from 'react';

export const DisclaimerSection: React.FC = () => {
  const sectionTitle = 'Disclaimer';

  const proseHTML = `
    <p style="margin-bottom: 1.5rem;">
      The risks and advice in the ESG Risk Check are based on public sources and are in line with the themes from the 
      <a href="https://mneguidelines.oecd.org/mneguidelines/" target="_blank"><strong><span style="text-decoration: underline;">OECD Guidelines</span></strong></a> and the 
      <a href="https://www.ohchr.org/sites/default/files/Documents/Publications/GuidingPrinciplesBusinessHR_EN.pdf" target="_blank"><strong><span style="text-decoration: underline;">UN Guiding Principles on Business and Human Rights</span></strong></a>. 
      In the ESG Risk Check, gender-neutral descriptions are used where possible in describing risks. If risks are not applicable to both men and women, gender specific terms will be used.
    </p>
    <p style="margin-bottom: 1.5rem;">
      The risks, identified by the ESG Risk Check, and information described and contained have been compiled from public online sources, which are subject to a reliability check based upon a reliability scheme before they are used. We do however not warrant or represent the correctness, accuracy, up-to-dateness, and completeness of the information processed, or wording of the risks used.
    </p>
    <p style="margin-bottom: 1.5rem;">
      The list of countries and territories that is used in the ESG Risk Check is the 
      <a href="https://www.iso.org/iso-3166-country-codes.html" target="_blank"><strong><span style="text-decoration: underline;">ISO 3166 standard</span></strong></a>, 
      which is based on the official list of country and territory names as defined by the United Nations Statistics Division. 
      For the world map Google Maps is used, this means that land borders and country names mentioned on this map are not the responsibility of MVO Nederland and may change resulting from international border disputes. 
      For the product classification in the tool, the 
      <a href="https://unstats.un.org/unsd/publication/SeriesM/SeriesM_34rev4E.pdf" target="_blank"><strong><span style="text-decoration: underline;">SITC codes</span></strong></a> are used, also established by the United Nations Statistics Division. 
      The product list is complemented by services that are derived from the 
      <a href="https://unstats.un.org/unsd/publication/seriesm/seriesm_4rev4e.pdf" target="_blank"><strong><span style="text-decoration: underline;">UN ISIC system</span></strong></a>.
    </p>
    <p style="margin-bottom: 1.5rem;">
      ESG risk information is not (yet) available for all countries and products, but this does not imply nor mean that no ESG risks will be present or occur. 
      In some cases, it may occur that a proper source to describe a certain risk has not yet been found or identified.
    </p>
    <p style="margin-bottom: 1.5rem;">
      Users downloading this free ESG risk report assume sole responsibility for all outcomes arising from its application. 
      When utilizing insights for material business decisions, engagement with accredited ESG specialists is strongly advised.
    </p>
  `;

  return (
    <section id="disclaimer" className="space-y-6">
      <h2 className="text-3xl font-black uppercase text-violet-800 scale-y-[0.9] tracking-wide">{sectionTitle}</h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-md p-6 md:flex-row md:items-start">
          <div className="flex justify-center md:w-48 md:min-w-[12rem]">
            <div className="h-24 w-full" />
          </div>
          <div className="flex-1 space-y-2">
            <div
              className="prose max-w-none text-[15px] leading-relaxed text-gray-800 prose-a:font-bold prose-a:underline"
              dangerouslySetInnerHTML={{ __html: proseHTML }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
