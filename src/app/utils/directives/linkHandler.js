import parseDomain from 'parse-domain';

import { PROTON_DOMAINS, LINK_WARNING } from '../../constants';
import { isExternal } from '../../../helpers/url';
import { getItem } from '../../../helpers/storageHelper';

/* @ngInject */
function linkHandler(dispatchers, messageModel, mailUtils, linkWarningModal) {
    const { dispatcher } = dispatchers(['composer.new']);
    const dispatch = (type, data = {}) => dispatcher['composer.new'](type, data);
    const getSrc = ({ target }) => (target.getAttribute('href') || '').toLowerCase();

    const onClick = (e) => {
        if (e.target.nodeName !== 'A') {
            return;
        }

        const src = getSrc(e);

        // We only handle anchor that begins with `mailto:`
        if (src.startsWith('mailto:')) {
            e.preventDefault();

            const message = messageModel(mailUtils.mailtoParser(e.target.getAttribute('href')));

            /*
                Open the composer with the given mailto address
                position isAfter true as the user can choose to set a body
                */
            return dispatch('new', { message, isAfter: true });
        }

        const dontAsk = getItem(LINK_WARNING.KEY);
        const { domain } = parseDomain(src);

        if (!dontAsk && isExternal(src) && !PROTON_DOMAINS.includes(domain)) {
            e.preventDefault();
            return linkWarningModal.activate({
                params: {
                    link: src,
                    close() {
                        linkWarningModal.deactivate();
                    }
                }
            });
        }
    };

    return {
        link(scope) {
            document.body.addEventListener('click', onClick);

            scope.$on('$destroy', () => {
                document.body.removeEventListener('click', onClick);
            });
        }
    };
}
export default linkHandler;
