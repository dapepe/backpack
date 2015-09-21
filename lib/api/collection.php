<?php
namespace Backpack;

/**
 * MongoDB Collections API
 *
 * @author Peter-Christoph Haider (Project Leader) et al.
 * @package Backpack
 * @version 1.1
 * @copyright Copyright (c) 2012-2014, Zeyon Technologies
 */
class CollectionAPI extends API {
	/**
	 * @var array An associative array mapping actions to their definitions.
	 *     Action format:    { <name> => [ <method>, <function>, <parameters> ] }
	 *       Methods:        POST, GET, REQUEST
	 *     Parameter format: [ <name>, <type>, <default> = '', <required> = true ]
	 *       Types:          int, float, bool, array, object, string
	 */
	public $actions = array(
		/*!
		 * @cmd list_collections
		 * @method any
		 * @description Lists all collections
		 * @return {array}
		 * @demo
		 */
		'list_collections' => array('ANY', 'list_collections', array()),
		/*!
		 * @cmd show_collection
		 * @method any
		 * @description Lists all collections
		 * @param {string} collection* The collection name
		 * @return {array}
		 * @demo
		 */
		'get_schema' => array('ANY', 'get_schema', array(
			array('collection', 'string', false),
		)),
		/*!
		 * @cmd list_documents
		 * @method any
		 * @description Lists all documents of a collection
		 * @param {string} collection* The collection name
		 * @param {string} query The selection query
		 * @param {string} sort The sorting
		 * @return {array}
		 */
		'list_documents' => array('ANY', 'list_documents', array(
			array('collection', 'string', false),
			array('query', 'array', array(), false),
			array('sort', 'array', false, false),
		)),
		/*!
		 * @cmd read_document
		 * @method any
		 * @description Reads a document
		 * @param {string} collection* The collection name
		 * @param {string} index* The document UID
		 * @return {array}
		 * @demo
		 */
		'read_document' => array('ANY', 'read_document', array(
			array('collection', 'string', false),
			array('index', 'string', false),
			array('history', 'string', false, false),
		)),
		/*!
		 * @cmd identify_document
		 * @method any
		 * @description Get a document idenfiert (and check it's existence)
		 * @param {string} collection* The collection name
		 * @param {string} index* The document UID
		 * @return {array}
		 * @demo
		 */
		'identify_document' => array('ANY', 'identify_document', array(
			array('collection', 'string', false),
			array('index', 'string', false),
		)),
		/*!
		 * @cmd write_document
		 * @method post
		 * @description
		 * @param {string} collection* The collection name
		 * @param {array} data* The collection data
		 * @return {bool}
		 * @demo
		 */
		'write_document' => array('POST', 'write_document', array(
			array('collection', 'string', false),
			array('data', 'array', false),
		)),
		/*!
		 * @cmd remove_document
		 * @method any
		 * @description Removes a document
		 * @param {string} collection* The collection name
		 * @param {string} index* The document UID
		 * @return {bool}
		 * @demo
		 */
		'remove_document' => array('ANY', 'remove_document', array(
			array('collection', 'string', false),
			array('index', 'string', false),
		)),
		/*!
		 * @cmd restore_document
		 * @method any
		 * @description Restores a deleted document
		 * @param {string} collection* The collection name
		 * @param {string} index* The document UID
		 * @return {bool}
		 * @demo
		 */
		'restore_document' => array('ANY', 'restore_document', array(
			array('collection', 'string', false),
			array('index', 'string', false),
		)),
		/*!
		 * @cmd restore_document
		 * @method any
		 * @description Restores a history entity of the document
		 * @param {string} collection* The collection name
		 * @param {string} index* The document UID
         * @param {string} historyidx The index of the history entrie
		 * @return {bool}
		 * @demo
		 */
		'restore_history' => array('ANY', 'restore_history', array(
			array('collection', 'string', false),
			array('index', 'string', false),
			array('historyidx', 'string', false),
		)),
	);

	public $auth_exceptions = array();

	/**
	 * List all files in a directory
	 *
	 * @return array
	 */
	public function do_list_collections() {
		$this->requireConnection();
		$strDir = $this->app->checkFileLocation('collections').DIRECTORY_SEPARATOR;

		// Alternative: $this->app->getDb()->getCollectionNames()
		$list = array();
		foreach (scandir($strDir) as $file) {
			if (preg_match('/.json$/i', $file)) {
				$id = preg_replace('/.json$/i', '', $file);
				$list[$id] = $this->app->showCollection($id);
			}
		}

		return $list;
	}

	/**
	 * Shows the collection schema
	 *
	 * @param  string $strCollection The collection name
	 * @return array
	 */
	public function do_get_schema($strCollection) {
		$this->requireConnection();

		return $this->app->showCollection($strCollection);
	}

	/**
	 * Lists all documents
	 *
	 * @param  string $strCollection The collection name
	 * @param  array  $arrQuery      The MongoDB Query
	 * @see    http://docs.mongodb.org/manual/reference/operator/
	 * @return string
	 */
	public function do_list_documents($strCollection, $arrQuery=array(), $arrSort=false) {
		$this->requireConnection();
		$col    = $this->app->getDb()->selectCollection($strCollection);
		$schema = $this->app->showCollection($strCollection);

        API::recStringBool2Bool($arrQuery);
        $saveQuery = [];
		if (isset($arrQuery['_deleted'])) {
            if ($arrQuery['_deleted'] )
                $saveQuery['_deleted'] = 1;
            else {
                $saveQuery['_deleted'] = array(
                    '$exists' => false
                );
            }
		}

		if (isset($schema['searchfields']) && isset($arrQuery['search']) && $arrQuery['search'] != '') {
			if (!is_array($schema['searchfields']))
				$schema['searchfields'] = [];
			if (!in_array('identifier', $schema['searchfields']))
				$schema['searchfields'][] = 'identifier';

			$saveQuery = [
				'$and' => [
					$saveQuery,
					['$or' => []]
				]
			];
			foreach ($schema['searchfields'] as $field)
				$saveQuery['$and'][1]['$or'][] = [$field => new \MongoRegex('/.*'.preg_quote($arrQuery['search'], '/').'.*/i')];
		}

        // by default exlude history
        $fields = array('_history' => 0);

        $cursor = $col->find($saveQuery, $fields);
        if ($arrSort) {
            foreach ($arrSort as &$type)
                $type = intval($type);

            $cursor->sort($arrSort);
        }

		$list = array();
		foreach ($cursor as $elem) {
            $this->cleanMongoEntity($elem);
			$list[] = $elem;
		}

		return $list;
	}

	/**
	 * Updates or creates a document
	 *
	 * @param  string $strCollection The collection name
	 * @param  array  $arrData       The document data
	 * @return string The document ID
	 */
	public function do_write_document($strCollection, $arrData) {
		$this->requireConnection();

		$settings = $this->app->showCollection($strCollection);

		$docData = [];
        if (isset($settings['properties'])) {
            // validate form data
            $locale = \Localizer::getInstance();
			$validator = new \REST\Validator($locale);

            $filter = $validator->fieldTypesToFilter($settings['properties']);

            $warnings = $validator->filterErrors($arrData, $this->initFilter($filter, $locale));

			// Get referenced documents
			foreach ($settings['properties'] as $pid => $prop) {
				if (preg_match('/^(collection|bucket)/', $prop['type'])) {
					if (isset($arrData[$pid])) {
						if ($arrData[$pid] !== '') {
							$colId = preg_replace('/^(collection|bucket):/', '', $prop['type']);
							if (preg_match('/^collection/', $prop['type']))
								$col = $this->app->mongoDb->selectCollection($colId);
							else
								$col = $this->app->mongoDb->getGridFS($colId);

							$mid = new \MongoId($arrData[$pid]);
							$document = $col->findOne(array(
								'_id' => $mid
							));
							if (!$document)
								$warnings[$pid] = 'Referenced document ' . $arrData[$pid] . ' not found for "' . $pid . '"';
							else
								$arrData[$pid] = $mid;
						} else {
							if (!isset($docData['$unset']))
								$docData['$unset'] = [];

							$docData['$unset'][$pid] = '';
							unset($arrData[$pid]);
						}
					}
				}
			}

            if ($warnings)
                return array('result' => array('validation' => false, 'warnings' => $warnings));
        }

		if (!isset($arrData['identifier']))
			throw new \Exception('Document must have an identifier!');

		if (!preg_match('/[a-z0-9_-]/i', $arrData['identifier']))
			throw new \Exception('Invalid identifier! Only letters, numbers, "_" and "-" are allowed');

		$col = $this->app->mongoDb->selectCollection($strCollection);

		// Check for unique identifiers
        $checkIdentifier = false;
		if (isset($arrData['_id'])) {
            $document = $col->findOne(array(
                '_id' => new \MongoId($arrData['_id'])
            ));
            if (!$document)
                throw new Exception('Could not found document with id: '.$arrData['id']);

            if ($document['identifier'] != $arrData['identifier'])
                $checkIdentifier = $arrData['identifier'];
		} else {
			$checkIdentifier = $arrData['identifier'];
		}

        if ($checkIdentifier !== false) {
            $found = $col->findOne(array(
                'identifier' => $arrData['identifier'],
                '_deleted' => array(
                    '$exists' => false
                )
            ));
            if ($found != null)
                throw new \Exception('Document identifier already exists!');
        }

		// Check indexes
        if (isset($settings['index']) && isset($settings['properties'])) {
            foreach ($settings['index'] as $property => $order) {
                if (!isset($settings['properties'][$property]))
                    throw new \Exception('You try to set index of not existing property: '.$property);

                $col->ensureIndex(array($property => $order));
            }
        }

		// Clear system properties for RAW documents
		if ($settings['contenttype'] == 'raw') {
			$content = json_decode($arrData['content'], 1);
			unset($arrData['content']);

			if (isset($content['_id']))
				unset($content['_id']);
			if (isset($content['creationdate']))
				unset($content['creationdate']);
			if (isset($content['identifier']))
				unset($content['identifier']);
			if (isset($content['_history']))
				unset($content['_history']);

			if (is_array($content))
				$arrData = array_merge($arrData, $content);
		}

		// Convert boolean values
        API::recStringBool2Bool($arrData);

        // temporary add "deleteIndex" for existing systems
        // to remove the unique index on column identifier
        // should be deleted then
		$col->deleteIndex('identifier');

		if (isset($arrData['_id'])) {
			$uid = new \MongoId($arrData['_id']);
			unset($arrData['_id']);

            // save history
            if ( !isset($document['_history']) )
                $document['_history'] = [];

            $arrData['_history'] = $document['_history'];
            if ( !is_array($arrData['_history']) )
                $arrData['_history'] = [];

            unset($document['_id']);
            unset($document['_history']);
            array_unshift($arrData['_history'], $document);

            if ( !isset($this->app->config['historylength']) )
                throw new \Exception('You have to define a max histroy length in the settings!');

            if ( count($arrData['_history']) > $this->app->config['historylength'] )
                array_pop($arrData['_history']);

			$arrData['lastmodified'] = new \MongoDate();
			$arrData['modifier'] = $this->app->username;

			$docData['$set'] = $arrData;
			$col->update(['_id' => $uid], $docData);
		} else {
			$arrData['_history'] = [];
			$arrData['creationdate'] = new \MongoDate();
			$arrData['lastmodified'] = new \MongoDate();
			$arrData['creator']      = $this->app->username;
			$arrData['modifier']     = $this->app->username;
			$col->insert($arrData);
			$uid = $arrData['_id'];
		}
		$col->ensureIndex(array('identifier' => 1));

		return (string) $uid;
	}

	/**
	 * Read a document
	 *
	 * @param  string $strCollection The collection name
	 * @param  string $strId         The document ID
	 * @return array The document content
	 */
	public function do_read_document($strCollection, $strId, $boolHistory=false) {
		$this->requireConnection();

		$settings = $this->app->showCollection($strCollection);

        API::recStringBool2Bool($boolHistory);

        // by default exlude history
        $fields = array();
        if ( !$boolHistory )
            $fields = array('_history' => 0);

		if (!$doc = $this->app->mongoDb->selectCollection($strCollection)->findOne(['_id' => new \MongoId($strId)], $fields))
			throw new \Exception('"'.$strId.'" document not found!');

        $this->cleanMongoEntity($doc);

        if ( $boolHistory ) {
            if ( !isset($doc['_history']) )
                $doc['_history'] = [];

            foreach ( $doc['_history'] as &$hdoc ) {
                $this->cleanMongoEntity($hdoc);

                $hdoc['_id'] = $doc['_id'];
            }
        }

		if ($settings['contenttype'] == 'raw') {
			$doc['content'] = $doc;
			unset($doc['content']['_id']);
			unset($doc['content']['creationdate']);
			unset($doc['content']['lastmodified']);
			unset($doc['content']['identifier']);
			unset($doc['content']['_history']);
			$doc['content'] = json_encode($doc['content'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
		}

		return $doc;
	}

	/**
	 * Get a document idenfiert (and check it's existence)
	 *
	 * @param  string $strCollection The collection name
	 * @param  string $strId         The document ID
	 * @return array The document content
	 */
	public function do_identify_document($strCollection, $strId) {
		$this->requireConnection();

		if (!$doc = $this->app->mongoDb->selectCollection($strCollection)->findOne(['_id' => new \MongoId($strId)], ['identifier']))
			throw new \Exception('Document "'.$strId.'" not found!');

		return $this->cleanMongoEntity($doc);
	}

	/**
	 * Remove a document from the collection
	 *
	 * @param  string $strCollection The collection name
	 * @param  string $strId         The document ID
	 * @return bool
	 */
	public function do_remove_document($strCollection, $strId) {
		$this->requireConnection();

		$col = $this->app->mongoDb->selectCollection($strCollection);

		if (!$doc = $col->findOne(['_id' => new \MongoId($strId)], ['_id', '_deleted']))
			throw new \Exception('Document not found!');

		if (isset($doc['_deleted']))
			return $col->remove(['_id' => new \MongoId($strId)]);

		$col->update(['_id' => $doc['_id']], ['$set' => ['_deleted' => 1]]);
	}

	/**
	 * Restore a deleted document from the collection
	 *
	 * @param  string $strCollection The collection name
	 * @param  string $strId         The document ID
	 * @return bool
	 */
	public function do_restore_document($strCollection, $strId) {
		$this->requireConnection();

		$col = $this->app->mongoDb->selectCollection($strCollection);

		if (!$doc = $col->findOne([
                '_id' => new \MongoId($strId),
                '_deleted' => 1
            ], ['_id', 'identifier']))
			throw new Exception('Deleted document not found!');

        // Check for doubles
        if ($col->findOne(array(
				'identifier' => $doc['identifier'],
				'_deleted' => array(
					'$exists' => false
				)
			)) != null )
            throw new \Exception('Can not restore because document identifier already exists!');

        // important: completely delete "_deleted" field and NOT set it to 0
		$col->update(['_id' => $doc['_id']], ['$unset' => ['_deleted' => ""]]);
	}

	/**
	 * Restore a history entity of the document from the collection
	 *
	 * @param  string $strCollection The collection name
	 * @param  string $strId         The document ID
	 * @param  string $intHistoryIdx The index of the history entrie
	 * @return bool
	 */
	public function do_restore_history($strCollection, $strId, $intHistoryIdx) {
		$this->requireConnection();

		$col = $this->app->mongoDb->selectCollection($strCollection);

		if (!$doc = $col->findOne([
                '_id' => new \MongoId($strId),
                '_deleted' => array(
                    '$exists' => false
                )
            ]))
			throw new \Exception('Deleted document not found!');

        if ( !isset($doc['_history'][$intHistoryIdx]) )
            throw new \Exception('Document history entity not found!');

        $hentity = $doc['_history'][$intHistoryIdx];

        if ( $hentity['identifier'] != $doc['identifier'] ) {
            $found = $col->findOne(array(
                'identifier' => $hentity['identifier'],
                '_deleted' => array(
                    '$exists' => false
                )
            ));
            if ( $found != null )
                throw new \Exception('Can not restore because document identifier already exists!');

        }

        $hentity['_id'] = $doc['_id'];
        $hentity['_history'] = $doc['_history'];

        unset($doc['_id']);
        unset($doc['_history']);

        array_unshift($hentity['_history'], $doc);

        if ( !isset($this->app->config['historylength']) )
            throw new \Exception('You have to define a max histroy length in the settings!');

        if ( count($hentity['_history']) > $this->app->config['historylength'] )
            array_pop($hentity['_history']);

        $hentity['lastmodified'] = new \MongoDate();
        $hentity['modifier'] = $this->app->username;

        $uid = $hentity['_id'];
        unset($hentity['_id']);

		$col->update(['_id' => new \MongoId($uid)], ['$set' => $hentity]);

        return true;
	}
}

?>
