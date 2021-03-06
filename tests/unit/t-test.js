import { setOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject, { get, set } from '@ember/object';
import { run } from '@ember/runloop';
import { setupIntl, addTranslations } from 'ember-intl/test-support';
import { t } from '@ember-intl/decorators';

module('Unit | @t', function(hooks) {
  setupTest(hooks);
  setupIntl(hooks, {
    'no.interpolations': 'text with no interpolations',
    'with.interpolations': 'Clicks: {clicks}'
  });

  hooks.beforeEach(function() {
    const intl = this.owner.lookup('service:intl');
    this.intl = intl;

    this.TestObject = class TestObject extends EmberObject {
      intl = intl;
    };
  });

  test('defines a computed property that translates without interpolations', function(assert) {
    const object = new class extends this.TestObject {
      @t('no.interpolations')
      property;
    }();

    assert.strictEqual(get(object, 'property'), 'text with no interpolations');
  });

  test('defines a computed property that translates with interpolations', function(assert) {
    const object = new class extends this.TestObject {
      numberOfClicks = 9;

      @t('with.interpolations', { clicks: 'numberOfClicks' })
      property;
    }();

    assert.strictEqual(get(object, 'property'), 'Clicks: 9');
  });

  test('defines a computed property with dependencies', function(assert) {
    const object = new class extends this.TestObject {
      numberOfClicks = 9;

      @t('with.interpolations', { clicks: 'numberOfClicks' })
      property;
    }();

    run(() => set(object, 'numberOfClicks', 13));
    assert.strictEqual(get(object, 'property'), 'Clicks: 13');
  });

  test('defines a computed property that depends on the locale', function(assert) {
    addTranslations('es', {
      'no.interpolations': 'texto sin interpolaciones'
    });

    const object = new class extends this.TestObject {
      @t('no.interpolations')
      property;
    }();

    assert.strictEqual(get(object, 'property'), 'text with no interpolations');
    run(() => this.intl.setLocale('es'));

    assert.strictEqual(get(object, 'property'), 'texto sin interpolaciones');
  });

  test('looks up the intl service through the owner, if it not injected', function(assert) {
    const object = new class {
      @t('no.interpolations')
      property;
    }();

    setOwner(object, {
      lookup: name => {
        assert.strictEqual(name, 'service:intl');
        return this.intl;
      }
    });

    assert.strictEqual(get(object, 'property'), 'text with no interpolations');
  });
});
